import traceback
import tools
from google.appengine.ext import ndb
from google.appengine.api import logservice, memcache
from models import Report, HabitDay
from constants import REPORT, GCS_REPORT_BUCKET
import cloudstorage as gcs
from datetime import datetime
import gc
import csv
import json
from common.decorators import deferred_task_decorator
import logging

TEST_TOO_LONG_ON_EVERY_BATCH = False
MC_EXPORT_STATUS = "MC_EXPORT_STATUS_%s"
MAX_REQUEST_SECONDS = 40*3


class TooLongError(Exception):
    def __init__(self):
        pass


class GCSReportWorker(object):
    KIND = None
    FILTERS = []
    ANCESTOR = None

    def __init__(self, rkey, start_att="__key__", start_att_desc=False):
        self.report = rkey.get()
        if not self.report:
            logging.error("Error retrieving report [ %s ] from db" % rkey)
            return
        self.report.status = REPORT.GENERATING
        self.report.put()
        self.user = self.report.key.parent().get()
        self.ANCESTOR = self.user
        self.counters = {
            'run': 0,
            'skipped': 0
        }
        self.worker_start = tools.unixtime()
        self.cursor = None
        self.start_att = start_att
        self.start_att_desc = start_att_desc
        self.worker_cancelled = False
        self.prefetch_props = []
        self.date_columns = []
        self.headers = []
        self.date_att = None
        self.projection = None
        self.cursor = None
        self.query = None
        self.batch_size = 300
        self.report_prog_mckey = MC_EXPORT_STATUS % self.report.key
        self.setProgress({'val': 0, "status": REPORT.GENERATING})
        self.gcs_file = gcs.open(self.get_gcs_filename(), 'w')

        # From: https://code.google.com/p/googleappengine/issues/detail?id=8809
        logservice.AUTOFLUSH_ENABLED = True
        logservice.AUTOFLUSH_EVERY_BYTES = None
        logservice.AUTOFLUSH_EVERY_SECONDS = 1
        logservice.AUTOFLUSH_EVERY_BYTES = 1024
        logservice.AUTOFLUSH_EVERY_LINES = 1

    def get_gcs_filename(self):
        r = self.report
        title = r.title
        if title:
            title = title.replace("/","").replace("?","").replace(" ", "_")
        else:
            title = "unnamed"
        filename = GCS_REPORT_BUCKET + "/uid:%d/%s-%s.%s" % (self.user.key.id(), title, r.key.id(), r.extension)
        r.gcs_files.append(filename)
        return r.gcs_files[-1]

    @deferred_task_decorator
    def run(self, start_cursor=None):
        self.worker_start = tools.unixtime()
        self.cursor = start_cursor
        self.setProgress({'max':self.count(), 'report': self.report.json()})

        if not start_cursor:
            self.writeHeaders()

        try:
            # This is heavy
            self.writeData()
        except TooLongError:
            logging.debug("TooLongError: Going to the next batch")
            if self.report:
                self.finish(reportDone=False)
                tools.safe_add_task(self.run, start_cursor=self._get_cursor(), _queue="report-queue")
        except Exception, e:  # including DeadlineExceededError
            traceback.print_exc()
            logging.error("Error: %s" % e)
            self.setProgress({'error': "Error occurred: %s" % e, 'status': REPORT.ERROR})
            return
        else:
            tools.safe_add_task(self.finish)

    def writeHeaders(self):
        if self.report.ftype == REPORT.CSV:
            string = tools.normalize_to_ascii('"'+'","'.join(self.headers)+'"\n')
            self.gcs_file.write(string)
            logging.debug(string)

    def writeData(self):
        total_i = self.counters['run']
        while True:
            self.query = self._get_query()
            if self.query:
                entities, self.cursor, more = self.query.fetch_page(self.batch_size, start_cursor=self.cursor)
                if not entities:
                    logging.debug("No rows returned by query -- done")
                    return
                else:
                    logging.debug("Got %d rows" % len(entities))
                for entity in entities:
                    if entity:
                        ed = self.entityData(entity)
                    else:
                        continue
                    string = '?'
                    if self.report.ftype == REPORT.CSV:
                        csv.writer(self.gcs_file).writerow(tools.normalize_list_to_ascii(ed))
                    elif self.report.ftype == REPORT.XLS:
                        self.gcs_file.write(json.dumps(ed)+"\n")
                        if total_i > REPORT.XLS_ROW_LIMIT:
                            self.setProgress({'error': "XLS row limit (%d) exceeded!" % REPORT.XLS_ROW_LIMIT, 'status': REPORT.ERROR})
                            return
                    self.gcs_file.flush()

                    total_i += 1
                    self.counters['run'] += 1
                    if total_i % 100 == 0:
                        cancelled = self.updateProgressAndCheckIfCancelled()
                        if cancelled:
                            self.report.CleanDelete()
                            logging.debug("Worker cancelled by user, report deleted.")
                            return

                logging.debug("Batch of %d done" % len(entities))
                elapsed_ms = tools.unixtime() - self.worker_start
                elapsed = elapsed_ms / 1000
                if elapsed >= MAX_REQUEST_SECONDS or (tools.on_dev_server() and TEST_TOO_LONG_ON_EVERY_BATCH):
                    logging.debug("Elapsed %ss" % elapsed)
                    raise TooLongError()

            # self.setProgress() TODO: Implement background tasks via memcache

    def updateProgressAndCheckIfCancelled(self):
        progress = self.getProgress()
        return progress and progress.get('status') == REPORT.CANCELLED

    def getProgress(self):
        return memcache.get(self.report_prog_mckey)

    def setProgress(self, updatedProgress):
        progress = self.getProgress()
        if progress:
            progress.update(updatedProgress)
        else:
            progress = updatedProgress
        memcache.set(self.report_prog_mckey, progress)

    def entityData(self, entity):
        """
        Override with format specific to report type
        """
        self.setProgress({'val': 0})
        return []

    @deferred_task_decorator
    def finish(self, reportDone=True):
        """Called when the worker has finished, to allow for any final work to be done."""
        progress = None
        if reportDone:
            self.gcs_file.close()
            self.report.status = REPORT.DONE
            self.report.dt_generated = datetime.now()
            self.report.put()
            duration = self.report.get_duration()
            logging.debug("GCSReportWorker finished. Counters: %s. Report ran for %d seconds." % (self.counters, duration))
            progress = {
                "status": REPORT.DONE,
                "resource": self.report.get_gcs_file(),
                "generated": tools.unixtime(dt=self.report.dt_generated),
                "report": self.report.json(),
                "duration": duration
            }
        else:
            logging.debug("Batch finished. Counters: %s" % (self.counters))
        p = {
            'val': self.counters['run'],
            "filename": self.report.title
        }
        if progress:
            p.update(progress)
        self.setProgress(p)
        gc.collect()  # Garbage collector

    def _get_cursor(self):
        return self.query.cursor() if self.query else None

    def _get_query(self):
        """Returns a query over the specified kind, with any appropriate filters applied."""
        if self.FILTERS or self.ANCESTOR:
            kwargs = {}
            if self.ANCESTOR:
                kwargs['ancestor'] = self.ANCESTOR.key
            q = self.KIND.query(**kwargs)
            if self.FILTERS:
                for f in self.FILTERS:
                    q = q.filter(f)
            if self.start_att_desc:
                q = q.order(-self.KIND._properties[self.start_att])
            else:
                q = q.order(self.KIND._properties[self.start_att])
            return q
        else:
            logging.debug("No FILTERS or ANCESTOR, not querying")
            return None

    def count(self, limit=20000):
        q = self.KIND.query()
        for f in self.FILTERS:
            q = q.filter(f)
        if self.date_att and self.report.hasDateRange():
            q = q.order(self.date_att)
            if self.report.dateRange[0]:
                q = q.filter(self.KIND._properties[self.date_att] > tools.ts_to_dt(self.report.dateRange[0]))
            if self.report.dateRange[1]:
                q = q.filter(self.KIND._properties[self.date_att] > tools.ts_to_dt(self.report.dateRange[1]))
        return q.count(limit=limit)


class HabitReportWorker(GCSReportWorker):
    KIND = HabitDay
    DATE_FMT = "%Y-%m-%d %H:%M:%S %Z"

    def __init__(self, rkey):
        super(HabitReportWorker, self).__init__(rkey, start_att="dt_created")
        title_kwargs = {}
        specs = self.report.get_specs()
        start = specs.get("start", 0)
        end = specs.get("end", 0)
        if start:
            self.FILTERS.append(HabitDay.dt_created >= tools.dt_from_ts(start))
        if end:
            self.FILTERS.append(HabitDay.dt_created < tools.dt_from_ts(end))
        self.report.generate_title("Habit Report", ts_start=start, ts_end=end, **title_kwargs)
        self.prefetch_props = ['habit']
        self.headers = ["Created", "Updated", "Habit", "Done", "Committed"]
        self.batch_size = 1000

    def entityData(self, hd):
        habit = hd.habit.get()
        row = [
            tools.sdatetime(hd.dt_created, fmt=self.DATE_FMT),
            tools.sdatetime(hd.dt_updated, fmt=self.DATE_FMT),
            habit.name if habit else "",
            "1" if hd.done else "0",
            "1" if hd.committed else "0"
        ]
        return row

