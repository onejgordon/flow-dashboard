import os
import webapp2
from constants import COOKIE_NAME
from actions import adminActions
from views import views
import imp
import api
import tasks
try:
    imp.find_module('secrets', ['settings'])
except ImportError:
    from settings import secrets_template as secrets
else:
    from settings import secrets

SECS_PER_WEEK = 60 * 60 * 24 * 7
# Enable ctypes -> Jinja2 tracebacks
PRODUCTION_MODE = not os.environ.get(
    'SERVER_SOFTWARE', 'Development').startswith('Development')

ROOT_DIRECTORY = os.path.dirname(__file__)

if not PRODUCTION_MODE:
    # from google.appengine.tools.devappserver2.python import sandbox
    # sandbox._WHITE_LIST_C_MODULES += ['_ctypes', 'gestalt']
    TEMPLATE_DIRECTORY = os.path.join(ROOT_DIRECTORY, 'src')
else:
    TEMPLATE_DIRECTORY = os.path.join(ROOT_DIRECTORY, 'dist')

curr_path = os.path.abspath(os.path.dirname(__file__))


config = {
    'webapp2_extras.sessions': {
        'secret_key': secrets.COOKIE_KEY,
        'session_max_age': SECS_PER_WEEK,
        'cookie_args': {'max_age': SECS_PER_WEEK},
        'cookie_name': COOKIE_NAME
    },
    'webapp2_extras.jinja2': {
        'template_path': TEMPLATE_DIRECTORY
    }
}

app = webapp2.WSGIApplication(
    [
        # Admin Actions
        webapp2.Route('/admin/gauth/initialize', handler=adminActions.Init, name="aInit"),
        webapp2.Route('/admin/gauth/hacks', handler=adminActions.Hacks),

        # API
        webapp2.Route('/api/user/me', handler=api.UserAPI, handler_method="update_self", methods=["POST"]),
        webapp2.Route('/api/user', handler=api.UserAPI, handler_method="list", methods=["GET"]),
        webapp2.Route('/api/project/active', handler=api.ProjectAPI, handler_method="active", methods=["GET"]),
        webapp2.Route('/api/project', handler=api.ProjectAPI, handler_method="list", methods=["GET"]),
        webapp2.Route('/api/project', handler=api.ProjectAPI, handler_method="update", methods=["POST"]),
        webapp2.Route('/api/project/delete', handler=api.ProjectAPI, handler_method="delete", methods=["POST"]),
        webapp2.Route('/api/habit', handler=api.HabitAPI, handler_method="list", methods=["GET"]),
        webapp2.Route('/api/habit/recent', handler=api.HabitAPI, handler_method="recent", methods=["GET"]),
        webapp2.Route('/api/habit/range', handler=api.HabitAPI, handler_method="range", methods=["GET"]),
        webapp2.Route('/api/habit/toggle', handler=api.HabitAPI, handler_method="toggle", methods=["POST"]),
        webapp2.Route('/api/habit/increment', handler=api.HabitAPI, handler_method="increment", methods=["POST"]),
        webapp2.Route('/api/habit/commit', handler=api.HabitAPI, handler_method="commit", methods=["POST"]),
        webapp2.Route('/api/habit/delete', handler=api.HabitAPI, handler_method="delete", methods=["POST"]),
        webapp2.Route('/api/habit', handler=api.HabitAPI, handler_method="update", methods=["POST"]),
        webapp2.Route('/api/habit/delete', handler=api.HabitAPI, handler_method="delete", methods=["POST"]),
        webapp2.Route('/api/habit/<id>', handler=api.HabitAPI, handler_method="detail", methods=["GET"]),
        webapp2.Route('/api/goal', handler=api.GoalAPI, handler_method="list", methods=["GET"]),
        webapp2.Route('/api/goal/current', handler=api.GoalAPI, handler_method="current", methods=["GET"]),
        webapp2.Route('/api/goal', handler=api.GoalAPI, handler_method="update", methods=["POST"]),
        webapp2.Route('/api/event', handler=api.EventAPI, handler_method="list", methods=["GET"]),
        webapp2.Route('/api/event', handler=api.EventAPI, handler_method="update", methods=["POST"]),
        webapp2.Route('/api/event/batch', handler=api.EventAPI, handler_method="batch_create", methods=["POST"]),
        webapp2.Route('/api/event/delete', handler=api.EventAPI, handler_method="delete", methods=["POST"]),
        webapp2.Route('/api/journal/today', handler=api.JournalAPI, handler_method="today", methods=["GET"]),
        webapp2.Route('/api/journal/year', handler=api.JournalAPI, handler_method="year", methods=["GET"]),
        webapp2.Route('/api/journal/submit', handler=api.JournalAPI, handler_method="submit", methods=["POST"]),
        webapp2.Route('/api/journal', handler=api.JournalAPI, handler_method="list", methods=["GET"]),
        webapp2.Route('/api/journal', handler=api.JournalAPI, handler_method="update", methods=["POST"]),
        webapp2.Route('/api/snapshot', handler=api.SnapshotAPI, handler_method="submit", methods=["POST"]),
        webapp2.Route('/api/snapshot', handler=api.SnapshotAPI, handler_method="list", methods=["GET"]),
        webapp2.Route('/api/tracking', handler=api.TrackingAPI, handler_method="list", methods=["GET"]),
        webapp2.Route('/api/tracking', handler=api.TrackingAPI, handler_method="update", methods=["POST"]),
        webapp2.Route('/api/task', handler=api.TaskAPI, handler_method="list", methods=["GET"]),
        webapp2.Route('/api/task', handler=api.TaskAPI, handler_method="update", methods=["POST"]),
        webapp2.Route('/api/task/delete', handler=api.TaskAPI, handler_method="delete", methods=["POST"]),
        webapp2.Route('/api/task/action', handler=api.TaskAPI, handler_method="action", methods=["POST"]),
        webapp2.Route('/api/readable', handler=api.ReadableAPI, handler_method="list", methods=["GET"]),
        webapp2.Route('/api/readable', handler=api.ReadableAPI, handler_method="update", methods=["POST"]),
        webapp2.Route('/api/readable/delete', handler=api.ReadableAPI, handler_method="delete", methods=["POST"]),
        webapp2.Route('/api/readable/batch', handler=api.ReadableAPI, handler_method="batch_create", methods=["POST"]),
        webapp2.Route('/api/readable/random', handler=api.ReadableAPI, handler_method="random_batch", methods=["GET"]),
        webapp2.Route('/api/readable/search', handler=api.ReadableAPI, handler_method="search", methods=["GET"]),
        webapp2.Route('/api/quote', handler=api.QuoteAPI, handler_method="list", methods=["GET"]),
        webapp2.Route('/api/quote', handler=api.QuoteAPI, handler_method="update", methods=["POST"]),
        webapp2.Route('/api/quote/batch', handler=api.QuoteAPI, handler_method="batch_create", methods=["POST"]),
        webapp2.Route('/api/quote/random', handler=api.QuoteAPI, handler_method="random_batch", methods=["GET"]),
        webapp2.Route('/api/quote/search', handler=api.QuoteAPI, handler_method="search", methods=["GET"]),
        webapp2.Route('/api/quote/action', handler=api.QuoteAPI, handler_method="action", methods=["POST"]),
        webapp2.Route('/api/quote/delete', handler=api.QuoteAPI, handler_method="delete", methods=["POST"]),
        webapp2.Route('/api/analysis', handler=api.AnalysisAPI, handler_method="get", methods=["GET"]),
        webapp2.Route('/api/journaltag', handler=api.JournalTagAPI, handler_method="list", methods=["GET"]),
        webapp2.Route('/api/report', handler=api.ReportAPI, handler_method="list", methods=["GET"]),
        webapp2.Route('/api/report/generate', handler=api.ReportAPI, handler_method="generate", methods=["POST"]),
        webapp2.Route('/api/report/serve', handler=api.ReportAPI, handler_method="serve", methods=["GET"]),
        webapp2.Route('/api/report/delete', handler=api.ReportAPI, handler_method="delete", methods=["POST"]),
        webapp2.Route('/api/feedback', handler=api.FeedbackAPI, handler_method="submit", methods=["POST"]),

        webapp2.Route('/api/auth/google_login', handler=api.AuthenticationAPI, handler_method="google_login"),
        webapp2.Route('/api/auth/google_auth', handler=api.AuthenticationAPI, handler_method="google_auth"),
        webapp2.Route('/api/auth/google/token', handler=api.AuthenticationAPI, handler_method="google_token", methods=["POST"]),
        webapp2.Route('/api/auth/google/oauth2callback', handler=api.AuthenticationAPI, handler_method="google_oauth2_callback"),
        webapp2.Route('/api/auth/google/<service_name>/authenticate', handler=api.AuthenticationAPI, handler_method="google_service_authenticate"),
        webapp2.Route('/api/auth/fbook_auth', handler=api.AuthenticationAPI, handler_method="fbook_auth"),
        webapp2.Route('/api/auth/logout', handler=api.AuthenticationAPI, handler_method="logout"),

        # Integrations
        webapp2.Route('/api/integrations/update_integration_settings', handler=api.IntegrationsAPI, handler_method="update_integration_settings", methods=["POST"]),
        webapp2.Route('/api/integrations/goodreads', handler=api.IntegrationsAPI, handler_method="goodreads_shelf", methods=["GET"]),
        webapp2.Route('/api/integrations/pocket', handler=api.IntegrationsAPI, handler_method="pocket_sync", methods=["GET"]),
        webapp2.Route('/api/integrations/pocket/authenticate', handler=api.IntegrationsAPI, handler_method="pocket_authenticate", methods=["POST"]),
        webapp2.Route('/api/integrations/pocket/authorize', handler=api.IntegrationsAPI, handler_method="pocket_authorize", methods=["POST"]),
        webapp2.Route('/api/integrations/pocket/disconnect', handler=api.IntegrationsAPI, handler_method="pocket_disconnect", methods=["POST"]),
        webapp2.Route('/api/integrations/evernote/authenticate', handler=api.IntegrationsAPI, handler_method="evernote_authenticate", methods=["POST"]),
        webapp2.Route('/api/integrations/evernote/authorize', handler=api.IntegrationsAPI, handler_method="evernote_authorize", methods=["POST"]),
        webapp2.Route('/api/integrations/evernote/disconnect', handler=api.IntegrationsAPI, handler_method="evernote_disconnect", methods=["POST"]),
        webapp2.Route('/api/integrations/evernote/webhook', handler=api.IntegrationsAPI, handler_method="evernote_webhook", methods=["GET"]),

        # Agent
        webapp2.Route('/api/agent/apiai/request', handler=api.AgentAPI, handler_method="apiai_request", methods=["POST"]),
        webapp2.Route('/api/agent/fbook/request', handler=api.AgentAPI, handler_method="fbook_request"),
        webapp2.Route('/api/agent/flowapp/request', handler=api.AgentAPI, handler_method="flowapp_request"),
        webapp2.Route('/api/agent/spoof', handler=api.AgentAPI, handler_method="spoof", methods=["POST"]),

        # Reports
        webapp2.Route('/api/report/serve', handler=api.ReportAPI, handler_method="serve", methods=["GET"]),

        # Cron jobs (see cron.yaml)
        webapp2.Route('/cron/readables/sync', handler=tasks.SyncReadables),
        webapp2.Route('/cron/pull/github', handler=tasks.SyncGithub),
        webapp2.Route('/cron/pull/google_fit', handler=tasks.SyncFromGoogleFit),
        webapp2.Route('/cron/push/bigquery', handler=tasks.PushToBigQuery),
        webapp2.Route('/cron/reports/delete_old', handler=tasks.DeleteOldReports),
        webapp2.Route('/_ah/warmup', handler=tasks.WarmupHandler),

        # Private app (react)
        webapp2.Route(r'/<:.*>', handler=views.App, name="PrivateApp"),
    ], debug=True,
config=config)
