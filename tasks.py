import logging
from models import User, TrackingDay
import handlers
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
        for user in users:
            # Pocket
            access_token = user.get_integration_prop('pocket_access_token')
            if access_token:
                last_timestamp = user.get_integration_prop(TS_KEY, 0)
                success, readables, latest_timestamp = pocket.sync(user, access_token, last_timestamp)
                logging.debug("Got %d readables from pocket" % len(readables))
                user.set_integration_prop(TS_KEY, latest_timestamp)
                user.put()
                success, readables = goodreads.get_books_on_shelf(user, shelf='currently-reading')
                logging.debug("Got %d readables from good reads" % len(readables))


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
            updater = GithubClient(user)
            if updater._can_run():
                commits = updater.get_contributions_on_day(date)
                if commits is not None:
                    td = TrackingDay.Create(user, date)
                    td.Update(data={
                        'commits': commits
                    })
                    td.put()
                    res = td.json()
            else:
                logging.debug("Github updater can't run")
        self.json_out(res, debug=True)
