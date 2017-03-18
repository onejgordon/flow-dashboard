import sys, logging, traceback
import webapp2
from webapp2_extras import jinja2
from google.appengine.api import memcache, mail
from common import my_filters
from webapp2_extras import sessions
from constants import *
import json

def jinja2_factory(app):
    j = jinja2.Jinja2(app)
    j.environment.filters.update({
        'printjson': my_filters.printjson
    })
    j.environment.tests.update({
        })
    # j.package_path = 'views/templates'
    j.environment.globals.update({
        # Set global variables.
        'uri_for': webapp2.uri_for,
        # ...
    })
    return j


class BaseRequestHandler(webapp2.RequestHandler):
    @webapp2.cached_property
    def jinja2(self):
        return jinja2.get_jinja2(factory=jinja2_factory)

    def render_template(self, filename, **template_args):
        self.response.write(self.jinja2.render_template(filename, **template_args))

    def json_out(self, data, pretty=False, debug=False):
        indent = 4 if pretty else None
        _json = json.dumps(data, indent=indent)
        if pretty:
            _json = "<pre>%s</pre>" % _json
        if debug:
            logging.debug(_json)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(_json)

    def handle_exception(self, exception, debug_mode):
        exception_name = sys.exc_info()[0].__name__
        exception_details = str(sys.exc_info()[1])
        exception_traceback = ''.join(traceback.format_exception(*sys.exc_info()))
        logging.error(exception_traceback)
        exception_expiration = 3600 # seconds (max 1 mail per hour for a particular exception)
        sitename = SITENAME
        throttle_name = 'exception-'+exception_name
        throttle = memcache.get(throttle_name)
        if throttle is None:
            session = self.session
            if session and session.has_key('user'):
                uname = str(session['user'])
            else:
                uname = "Unknown"
            memcache.add(throttle_name, 1, exception_expiration)
            subject = '[%s] exception, user:%s [%s: %s]' % (sitename, uname, exception_name, exception_details)
            mail.send_mail(to=ADMIN_EMAIL, sender=SENDER_EMAIL,
                                     subject=subject,
                                     body=exception_traceback)
        template_values = {}
        template_values['traceback'] = exception_traceback
        template_values['sitename'] = sitename
        self.render_template("error.html", **template_values)

    def log_request_params(self):
        logging.debug([(arg, self.request.get_all(arg)) for arg in self.request.arguments()])

    def dispatch(self):
        # Get a session store for this request.
        self.session_store = sessions.get_store(request=self.request)

        try:
            # Dispatch the request.
            webapp2.RequestHandler.dispatch(self)
        finally:
            # Save all sessions.
            self.session_store.save_sessions(self.response)

    @webapp2.cached_property
    def session(self):
        # Returns a session using the default cookie key.
        return self.session_store.get_session(backend="datastore")

    def signout(self):
        if 'user' in self.session:
            for key in self.session.keys():
                del self.session[key]

    def update_session_user(self, user):
        logging.debug("Updating user in session (%s)" % user.key.id())
        self.session['user'] = user


class JsonRequestHandler(BaseRequestHandler):

    def __init__(self, request=None, response=None):
        super(JsonRequestHandler, self).__init__(request=request,
            response=response)
        self.success = False
        self.message = None

    def set_response(self, data=None, debug=False, success=None):
        res = {
            'success': self.success if success is None else success,
            'message': self.message
        }
        if data:
            res.update(data)
        self.json_out(res, debug=debug)
