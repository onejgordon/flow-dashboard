import traceback
import tools
from google.appengine.ext import ndb
from google.appengine.api import logservice, memcache
from models import Report, HabitDay, Task, Goal, MiniJournal, Event
from constants import REPORT, GCS_REPORT_BUCKET, GOAL
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
DATE_FMT = "%Y-%m-%d %H:%M:%S %Z"


class TooLongError(Exception):
    def __init__(self):
        pass


class GCSReportWorker(object):
    KIND = None

    def __init__(self, rkey, start_att="__key__", start_att_desc=False, title="Report"):
        self.report = rkey.get()
        if not self.report:
            logging.error("Error retrieving report [ %s ] from db" % rkey)
            return
        self.start_att = start_att
        self.start_att_desc = start_att_desc
        self.FILTERS = []
        self.report.status = REPORT.GENERATING
        self.specs = self.report.get_specs()
        self.start_ts = self.specs.get('start', 0)
        self.end_ts = self.specs.get('end', 0)
        self.report.generate_title(title, ts_start=self.start_ts, ts_end=self.end_ts)
        self.report.put()
        self.add_date_filters(start=self.start_ts, end=self.end_ts)
        self.user = self.report.key.parent().get()
        self.ancestor = self.user
        self.counters = {
            'run': 0,
            'skipped': 0
        }
        self.worker_start = tools.unixtime()
        self.cursor = None
        self.worker_cancelled = False
        self.prefetch_props = []
        self.date_columns = []
        self.headers = []
        self.projection = None
        self.cursor = None
        self.query = None
        self.batch_size = 1000
        self.report_prog_mckey = MC_EXPORT_STATUS % self.report.key
        self.setProgress({'val': 0, "status": REPORT.GENERATING})
        self.gcs_file = gcs.open(self.get_gcs_filename(), 'w')

        # From: https://code.google.com/p/googleappengine/issues/detail?id=8809
        logservice.AUTOFLUSH_ENABLED = True
        logservice.AUTOFLUSH_EVERY_BYTES = None
        logservice.AUTOFLUSH_EVERY_SECONDS = 1
        logservice.AUTOFLUSH_EVERY_BYTES = 1024
        logservice.AUTOFLUSH_EVERY_LINES = 1

    def add_date_filters(self, start=None, end=None):
        if start:
            self.FILTERS.append("%s >= DATETIME('%s 00:00:00')" % (self.start_att, tools.iso_date(tools.dt_from_ts(start))))
        if end:
            self.FILTERS.append("%s < DATETIME('%s 23:59:59')" % (self.start_att, tools.iso_date(tools.dt_from_ts(end))))

    def get_gcs_filename(self):
        r = self.report
        filename = GCS_REPORT_BUCKET + "/uid:%d/%s.%s" % (self.user.key.id(), r.key.id(), r.extension)
        r.gcs_files.append(filename)
        return r.gcs_files[-1]

    @deferred_task_decorator
    def run(self, start_cursor=None):
        self.worker_start = tools.unixtime()
        self.cursor = start_cursor

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
            csv.writer(self.gcs_file).writerow(tools.normalize_list_to_ascii(self.headers))

    def writeData(self):
        total_i = self.counters['run']
        while True:
            self.query = self._get_gql_query()
            if self.query:
                entities, self.cursor, more = self.KIND.gql(self.query).fetch_page(self.batch_size, start_cursor=self.cursor)
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
                    if self.report.ftype == REPORT.CSV:
                        csv.writer(self.gcs_file).writerow(tools.normalize_list_to_ascii(ed))
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

    def _get_gql_query(self):
        """Returns a query over the specified kind, with any appropriate filters applied."""
        if self.FILTERS or self.ancestor:
            query_string = "WHERE "
            if self.ancestor:
                query_string += "ANCESTOR IS KEY('%s')" % (self.ancestor.key.urlsafe())
            if self.FILTERS:
                query_string += ' AND ' + ' AND '.join(self.FILTERS)
            query_string += " ORDER BY %s" % self.start_att
            if self.start_att_desc:
                query_string += " DESC"
            return query_string
        else:
            logging.debug("No FILTERS or ancestor, not querying")


class HabitReportWorker(GCSReportWorker):
    KIND = HabitDay

    def __init__(self, rkey):
        super(HabitReportWorker, self).__init__(rkey, start_att="dt_created", title="Habit Report")
        self.prefetch_props = ['habit']
        self.headers = ["Created", "Updated", "Date", "Habit", "Done", "Committed"]

    def entityData(self, hd):
        habit = hd.habit.get()
        row = [
            tools.sdatetime(hd.dt_created, fmt=DATE_FMT),
            tools.sdatetime(hd.dt_updated, fmt=DATE_FMT),
            tools.iso_date(hd.date),
            habit.name if habit else "",
            "1" if hd.done else "0",
            "1" if hd.committed else "0"
        ]
        return row


class TaskReportWorker(GCSReportWorker):
    KIND = Task

    def __init__(self, rkey):
        super(TaskReportWorker, self).__init__(rkey, start_att="dt_created", title="Task Report")
        self.prefetch_props = ['habit']
        self.headers = [
            "Date Created", "Date Due", "Date Done", "Title", "Done", "Archived", "Seconds Logged",
            "Complete Sessions Logged"]

    def entityData(self, task):
        timer_ms = task.timer_total_ms or 0
        sess = task.timer_complete_sess or 0
        row = [
            tools.sdatetime(task.dt_created, fmt=DATE_FMT),
            tools.sdatetime(task.dt_due, fmt=DATE_FMT),
            tools.sdatetime(task.dt_done, fmt=DATE_FMT),
            task.title,
            "1" if task.is_done() else "0",
            "1" if task.archived else "0",
            str(timer_ms / 1000),
            str(sess)
        ]
        return row


class GoalReportWorker(GCSReportWorker):
    KIND = Goal

    def __init__(self, rkey):
        super(GoalReportWorker, self).__init__(rkey, start_att="dt_created", title="Goal Report")
        self.prefetch_props = ['habit']
        self.n_slots = int(self.user.get_setting_prop(['goals', 'preferences', 'slots'], default=GOAL.DEFAULT_GOAL_SLOTS))
        self.headers = ["Goal Period", "Date Created"]
        for i in range(1, self.n_slots+1):
            self.headers.append("Text %s" % i)
        self.headers.extend(["Goal Assessments", "Overall Assessment"])

    def entityData(self, goal):
        n_texts = len(goal.text) if goal.text else 0
        row = [goal.key.id(), tools.sdatetime(goal.dt_created, fmt=DATE_FMT)]
        slots = [(goal.text[i] if n_texts > i else "") for i in range(self.n_slots)]
        row += slots
        row += [','.join([str(a) for a in goal.assessments]) if goal.assessments else ""]
        row += [str(goal.assessment) if goal.assessment else ""]
        return row


class JournalReportWorker(GCSReportWorker):
    KIND = MiniJournal

    def __init__(self, rkey):
        super(JournalReportWorker, self).__init__(rkey, start_att="dt_created", title="Journal Report")
        self.prefetch_props = ['habit']
        self.headers = ["Date", "Tags", "Location", "Data"]

    def entityData(self, jrnl):
        row = [
            tools.iso_date(jrnl.date),
            ', '.join([key.id() for key in jrnl.tags]),
            str(jrnl.location) if jrnl.location else "",
            jrnl.data if jrnl.data else ""
        ]
        return row


class EventReportWorker(GCSReportWorker):
    KIND = Event

    def __init__(self, rkey):
        super(EventReportWorker, self).__init__(rkey, start_att="date_start", title="Event Report")
        self.headers = ["Date Start", "Date End", "Title", "Details", "Color"]

    def entityData(self, event):
        row = [
            tools.iso_date(event.date_start),
            tools.iso_date(event.date_end),
            event.title,
            event.details,
            event.color
        ]
        return row
