import logging
from models import User, TrackingDay
import handlers
from google.appengine.ext import ndb
from datetime import datetime, timedelta
import tools


class WarmupHandler(handlers.BaseRequestHandler):
    def get(self):
        logging.info("Warmup Request")


class SyncReadables(handlers.BaseRequestHandler):
    def get(self):
        from services import pocket, goodreads
        logging.debug("Running SyncReadables cron...")
        TS_KEY = 'pocket_last_timestamp'
        users = User.query().fetch(limit=100)
        user_put = []
        for user in users:
            # Pocket
            user_changes = False
            access_token = user.get_integration_prop('pocket_access_token')
            if access_token:
                last_timestamp = user.get_integration_prop(TS_KEY, 0)
                success, readables, latest_timestamp = pocket.sync(user, access_token, last_timestamp)
                logging.debug("Got %d readables from pocket" % len(readables))
                user.set_integration_prop(TS_KEY, latest_timestamp)
                user_changes = True
            success, readables = goodreads.get_books_on_shelf(user, shelf='currently-reading')
            logging.debug("Got %d readables from good reads" % len(readables))
            if user_changes:
                user_put.append(user)
        ndb.put_multi(user_put)


class SyncProductivity(handlers.BaseRequestHandler):
    def get(self):
        from services.github import GithubClient
        date = self.request.get('date')
        if date:
            date = tools.fromISODate(date).date()
        else:
            date = (datetime.today() - timedelta(days=1)).date()
        users = User.query().fetch(limit=100)
        res = {}
        for user in users:
            logging.debug("Running SyncProductivity cron for %s on %s..." % (user, date))
            gh_client = GithubClient(user)
            if gh_client._can_run():
                commits = gh_client.get_contributions_on_day(date)
                if commits is not None:
                    td = TrackingDay.Create(user, date)
                    td.Update(data={
                        'commits': commits
                    })
                    td.put()
                    # TODO: put_multi
                    res = td.json()
            else:
                logging.debug("Github updater can't run")
        self.json_out(res, debug=True)


class DeleteOldReports(handlers.BaseRequestHandler):
    def get(self):
        from models import Report
        cutoff = datetime.now() - timedelta(days=30)
        old_reports = Report.query().filter(Report.dt_created < cutoff).fetch(limit=None)
        n = 0
        if old_reports:
            for report in old_reports:
                try:
                    report.clean_delete(self_delete=False)
                except Exception, e:
                    logging.info(str(e))
            n = len(old_reports)
            ndb.delete_multi([dr.key for dr in old_reports])
        logging.debug("Deleted %d old reports" % n)


def backgroundReportRun(rkey, start_cursor=None):
    rkey = ndb.Key(urlsafe=rkey)
    r = rkey.get()
    if r:
        r.run(start_cursor=start_cursor)
