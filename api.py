
from datetime import datetime, timedelta, time
from models import Project, Habit, HabitDay, Goal, MiniJournal, User, Task, \
    Readable, TrackingDay, Event, JournalTag, Report, Quote, Snapshot
from constants import READABLE
from google.appengine.ext import ndb
from oauth2client import client
import authorized
import handlers
import tools
import logging
import random
from google.appengine.api import urlfetch, search
import json
import urllib
import imp
try:
    imp.find_module('secrets', ['settings'])
except ImportError:
    from settings import secrets_template as secrets
else:
    from settings import secrets


class ProjectAPI(handlers.JsonRequestHandler):

    @authorized.role('user')
    def list(self, d):
        projects = Project.Fetch(self.user)
        self.set_response({
            'projects': [p.json() for p in projects]
        }, success=True)

    @authorized.role('user')
    def active(self, d):
        projects = Project.Active(self.user)
        self.set_response({
            'projects': [p.json() for p in projects]
        }, success=True)

    @authorized.role('user')
    def update(self, d):
        '''
        Create or update
        '''
        id = self.request.get_range('id')
        params = tools.gets(self,
            strings=['title', 'subhead', 'url1', 'url2'],
            booleans=['starred', 'archived'],
            integers=['progress'],
            supportTextBooleans=True
        )
        if id:
            prj = self.user.get(Project, id=id)
        else:
            prj = Project.Create(self.user)
        if prj:
            update_urls = False
            urls = []
            if 'url1' in params:
                urls.append(params.get('url1'))
                update_urls = True
            if 'url2' in params:
                urls.append(params.get('url2'))
                update_urls = True
            if update_urls:
                params['urls'] = urls
            prj.Update(**params)
            prj.put()
            self.success = True
        self.set_response({
            'project': prj.json() if prj else None
        })

    @authorized.role('user')
    def delete(self, d):
        id = self.request.get_range('id')
        if id:
            prj = self.user.get(Project, id=id)
            prj.key.delete()
            self.success = True
        self.set_response()

class TaskAPI(handlers.JsonRequestHandler):

    @authorized.role('user')
    def list(self, d):
        tasks = Task.Recent(self.user)
        self.set_response({
            'tasks': [t.json() for t in tasks]
        }, success=True)

    @authorized.role('user')
    def update(self, d):
        '''
        Create or update
        '''
        id = self.request.get_range('id')
        params = tools.gets(self,
            strings=['title'],
            booleans=['archived', 'wip'],
            integers=['status']
        )
        logging.debug(params)
        if id:
            task = self.user.get(Task, id=id)
        else:
            task = Task.Create(self.user, None)
        if task:
            self.message = task.Update(**params)
            self.success = True
            task.put()
        self.set_response({
            'task': task.json() if task else None
        })


class HabitAPI(handlers.JsonRequestHandler):

    @authorized.role('user')
    def list(self, d):
        habits = Habit.All(self.user)
        self.set_response({
            'habits': [habit.json() for habit in habits]
        }, success=True)

    @authorized.role('user')
    def recent(self, d):
        '''
        Return recent days of all active habits
        '''
        self.success = True
        days = self.request.get_range('days', default=5)
        habits = Habit.Active(self.user)
        start_date = datetime.today() - timedelta(days=days)
        habitdays = HabitDay.Range(self.user, habits, start_date)
        self.set_response({
            'habits': [habit.json() for habit in habits],
            'habitdays': tools.lookupDict(habitdays,
                    keyprop="key_id",
                    valueTransform=lambda hd: hd.json())
        })

    @authorized.role('user')
    def range(self, d):
        '''
        Return recent days of all active habits
        '''
        start = self.request.get('start_date')
        end = self.request.get('end_date')
        habits = Habit.Active(self.user)
        habitdays = HabitDay.Range(self.user, habits, tools.fromISODate(start), until_date=tools.fromISODate(end))
        self.set_response({
            'habits': [habit.json() for habit in habits],
            'habitdays': tools.lookupDict(habitdays,
                    keyprop="key_id",
                    valueTransform=lambda hd: hd.json())
        }, success=True)

    @authorized.role('user')
    def toggle(self, d):
        '''
        Mark done/not-done for a habit day
        '''
        from constants import HABIT_DONE_REPLIES
        habit_id = self.request.get_range('habit_id')
        day_iso = self.request.get('date')
        habit = Habit.get_by_id(habit_id, parent=self.user.key)
        hd = None
        if habit:
            marked_done, hd = HabitDay.Toggle(habit, tools.fromISODate(day_iso))
            if marked_done:
                self.message = random.choice(HABIT_DONE_REPLIES)
            self.success = True
        self.set_response({
            'habitday': hd.json() if hd else None
        })

    @authorized.role('user')
    def commit(self, d):
        '''
        Mark done/not-done for a habit day
        '''
        from constants import HABIT_COMMIT_REPLIES
        habit_id = self.request.get_range('habit_id')
        day_iso = self.request.get('date')
        habit = self.user.get(Habit, id=habit_id)
        hd = None
        if habit:
            hd = HabitDay.Commit(habit, tools.fromISODate(day_iso))
            self.message = random.choice(HABIT_COMMIT_REPLIES)
            self.success = True
        self.set_response({
            'habitday': hd.json() if hd else None
        })

    @authorized.role('user')
    def update(self, d):
        '''
        Create or update
        '''
        id = self.request.get_range('id')
        params = tools.gets(self,
                            strings=['name', 'color', 'icon'],
                            booleans=['archived'],
                            integers=['tgt_weekly'],
                            supportTextBooleans=True
                            )
        habit = None
        if id:
            habit = self.user.get(Habit, id=id)
        else:
            name = params.get('name')
            if not name:
                self.message = "Name required"
            else:
                habit = Habit.Create(self.user)
        if habit:
            habit.Update(**params)
            habit.put()
            self.success = True
        self.set_response({
            'habit': habit.json() if habit else None
        })

    @authorized.role('user')
    def detail(self, id, d):
        with_days = self.request.get_range('with_days', default=0)
        habit = None
        habitdays = []
        if id:
            habit = self.user.get(Habit, id=id)
            if habit:
                if with_days:
                    since = datetime.today() - timedelta(days=with_days)
                    habitdays = HabitDay.Range(self.user, [habit], since)
                self.success = True
        self.set_response({
            'habit': habit.json() if habit else None,
            'habitdays': [hd.json() for hd in habitdays if hd]
            })

    @authorized.role('user')
    def delete(self, d):
        id = self.request.get_range('id')
        habit = self.user.get(Habit, id=id)
        if habit:
            habit = Habit.get_by_id(int(id), parent=self.user.key)
            habit.key.delete()
            self.success = True
        self.set_response()


class GoalAPI(handlers.JsonRequestHandler):

    @authorized.role('user')
    def list(self, d):
        goals = Goal.Recent(self.user)
        self.set_response({
            'goals': [goal.json() for goal in goals]
        }, success=True)

    @authorized.role('user')
    def current(self, d):
        [annual, monthly, longterm] = Goal.Current(self.user)
        self.set_response({
            'annual': annual.json() if annual else None,
            'monthly': monthly.json() if monthly else None,
            'longterm': longterm.json() if longterm else None
        }, success=True)

    @authorized.role('user')
    def update(self, d):
        '''
        Create or update
        '''
        id = self.request.get('id')
        params = tools.gets(self,
            strings=['text1', 'text2', 'text3', 'text4'],
            integers=['assessment']
        )
        goal = self.user.get(Goal, id=id)
        if not goal:
            goal = Goal.Create(self.user, id=id)
        if goal:
            text = []
            for i in range(1, 5):
                key = 'text%d' % i
                if key in params:
                    text_i = params.get(key)
                    if text_i:
                        text.append(text_i)
            if text:
                params['text'] = text
            goal.Update(**params)
            goal.put()
            self.message = "Assessment saved" if 'assessment' in params else "Goal saved"
            self.success = True
        else:
            self.message = "Couldn't create goal"
        self.set_response({
            'goal': goal.json() if goal else None
        })


class EventAPI(handlers.JsonRequestHandler):

    @authorized.role('user')
    def list(self, d):
        page, max, offset = tools.paging_params(self.request)
        events = Event.Fetch(self.user, limit=max, offset=offset)
        self.set_response({
            'events': [event.json() for event in events]
        }, debug=True, success=True)

    @authorized.role('user')
    def update(self, d):
        '''
        Create or update
        '''
        id = self.request.get_range('id')
        params = tools.gets(self,
            strings=['title', 'details', 'color'],
            dates=['date_start', 'date_end']
        )
        event = self.user.get(Event, id=id)
        if not event:
            start = params.get('date_start')
            if start:
                event = Event.Create(self.user, params.get('date_start'))
        if event:
            event.Update(**params)
            event.put()
            self.success = True
        else:
            self.message = "Couldn't create event"
        self.set_response({
            'event': event.json() if event else None
        })

    @authorized.role('user')
    def batch_create(self, d):
        events = json.loads(self.request.get('events'))
        dbp = []
        for e in events:
            if 'date_start' in e and isinstance(e['date_start'], basestring):
                e['date_start'] = tools.fromISODate(e['date_start'])
            if 'date_end' in e and isinstance(e['date_end'], basestring):
                e['date_end'] = tools.fromISODate(e['date_end']) if e.get('date_end') else e.get('date_start')
            if not e.get('date_end'):
                e['date_end'] = e.get('date_start')
            e = Event(self.user, **e)
            dbp.append(e)
        if dbp:
            ndb.put_multi(dbp)
            self.success = True
            self.message = "Putting %d" % len(dbp)
        self.set_response()

    @authorized.role('user')
    def delete(self, d):
        id = self.request.get_range('id')
        ev = self.user.get(Event, id=id)
        if ev:
            ev.key.delete()
            self.success = True
        self.set_response()


class ReadableAPI(handlers.JsonRequestHandler):

    @authorized.role('user')
    def list(self, d):
        page, max, offset = tools.paging_params(self.request)
        favorites = self.request.get_range('favorites') == 1
        with_notes = self.request.get_range('with_notes') == 1
        unread = self.request.get_range('unread') == 1
        read = self.request.get_range('read') == 1
        since = self.request.get('since')  # ISO
        readables = Readable.Fetch(self.user, favorites=favorites,
                                   unread=unread, read=read,
                                   with_notes=with_notes, since=since,
                                   limit=max, offset=offset)
        self.set_response({
            'readables': [r.json() for r in readables]
        }, success=True)

    @authorized.role('user')
    def update(self, d):
        id = self.request.get('id')
        params = tools.gets(self,
            integers=['type'],
            strings=['notes', 'title', 'url', 'author', 'source'],
            booleans=['read', 'favorite'])
        if id:
            r = self.user.get(Readable, id=id)
        else:
            # New
            r = Readable.CreateOrUpdate(self.user, None, **params)
        if r:
            r.Update(**params)
            if r.source == 'pocket':
                access_token = self.user.get_integration_prop('pocket_access_token')
                if access_token:
                    from services import pocket
                    if params.get('favorite') == 1:
                        pocket.update_article(access_token, r.source_id, action='favorite')
                    if params.get('read') == 1:
                        pocket.update_article(access_token, r.source_id, action='archive')
            r.put()
            self.success = True
        self.set_response({
            'readable': r.json() if r else None
        })

    @authorized.role('user')
    def batch_create(self, d):
        readings = json.loads(self.request.get('readings'))
        source = self.request.get('source', default_value='form')
        dbp = []
        for r in readings:
            type_string = r.get('type')
            if type_string:
                r['type'] = READABLE.LOOKUP.get(type_string.lower())
            r = Readable.CreateOrUpdate(self.user, None, source=source, read=True, **r)
            dbp.append(r)
        if dbp:
            ndb.put_multi(dbp)
            self.success = True
            self.message = "Putting %d" % len(dbp)
        self.set_response()

    @authorized.role('user')
    def random_batch(self, d):
        '''
        Return a random batch, optionally filtered
        '''
        BATCH_SIZE = 50
        sample_keys = Readable.Fetch(self.user, with_notes=True, limit=500, keys_only=True)
        if len(sample_keys) > BATCH_SIZE:
            sample_keys = random.sample(sample_keys, BATCH_SIZE)
        readables = ndb.get_multi(sample_keys)
        self.set_response({
            'readables': [r.json() for r in readables]
            }, success=True)

    @authorized.role('user')
    def search(self, d):
        term = self.request.get('term')
        self.success, self.message, readables = Readable.Search(self.user, term)
        data = {
            'readables': [r.json() for r in readables if r]
        }
        self.set_response(data)

    @authorized.role('user')
    def delete(self, d):
        id = self.request.get('id')
        r = self.user.get(Readable, id=id)
        if r:
            if r.source == 'pocket':
                access_token = self.user.get_integration_prop('pocket_access_token')
                if access_token:
                    from services import pocket
                    pocket.update_article(access_token, r.source_id, action='delete')
            r.key.delete()
            self.success = True
            self.message = "Deleted item"
        else:
            self.message = "Couldn't find item"
        self.set_response()


class QuoteAPI(handlers.JsonRequestHandler):

    @authorized.role('user')
    def list(self, d):
        page, max, offset = tools.paging_params(self.request)
        quotes = Quote.Fetch(self.user, limit=max, offset=offset)
        self.set_response({
            'quotes': [q.json() for q in quotes]
        }, success=True)

    @authorized.role('user')
    def update(self, d):
        id = self.request.get('id')
        params = tools.gets(self,
            strings=['source', 'content', 'link', 'location', 'date'],
            lists=['tags']
        )
        quote = None
        if id:
            quote = self.user.get(Quote, id=id)
        else:
            if 'date' in params:
                params['dt_added'] = tools.fromISODate(params.get('date'))
            quote = Quote.Create(self.user, **params)
            self.message = "Quote saved!" if quote else "Couldn't create quote"
            self.success = quote is not None
        quote.Update(**params)
        quote.put()
        self.set_response({
            'quote': quote.json() if quote else None
        })

    @authorized.role('user')
    def batch_create(self, d):
        quotes = json.loads(self.request.get('quotes'))
        dbp = []
        for q in quotes:
            if 'dt_added' in q and isinstance(q['dt_added'], basestring):
                q['dt_added'] = tools.fromISODate(q['dt_added'])
            q = Quote.Create(self.user, **q)
            dbp.append(q)
        if dbp:
            ndb.put_multi(dbp)
            self.success = True
            self.message = "Putting %d" % len(dbp)
        self.set_response()

    @authorized.role('user')
    def random_batch(self, d):
        '''
        Return a random batch, optionally filtered
        '''
        BATCH_SIZE = 50
        sample_keys = Quote.Fetch(self.user, limit=500, keys_only=True)
        if len(sample_keys) > BATCH_SIZE:
            sample_keys = random.sample(sample_keys, BATCH_SIZE)
        quotes = ndb.get_multi(sample_keys)
        self.set_response({
            'quotes': [q.json() for q in quotes]
            }, success=True)

    @authorized.role('user')
    def search(self, d):
        term = self.request.get('term')
        self.success, self.message, quotes = Quote.Search(self.user, term)
        data = {
            'quotes': [q.json() for q in quotes]
        }
        self.set_response(data)


class JournalTagAPI(handlers.JsonRequestHandler):

    @authorized.role('user')
    def list(self, d):
        tags = JournalTag.All(self.user)
        self.set_response({
            'tags': [tag.json() for tag in tags]
        }, success=True)


class JournalAPI(handlers.JsonRequestHandler):

    @authorized.role('user')
    def list(self, d):
        days = self.request.get_range('days', default=4)
        today = datetime.today()
        cursor = today
        journal_keys = []
        for i in range(days):
            iso_date = tools.iso_date(cursor)
            journal_keys.append(ndb.Key('MiniJournal', iso_date, parent=self.user.key))
            cursor -= timedelta(days=1)
        journals = ndb.get_multi(journal_keys)
        self.set_response({
            'journals': [j.json() for j in journals if j]
            }, success=True)

    @authorized.role('user')
    def today(self, d):
        '''
        Get today's journal (yesterday if early morning)
        '''
        jrnl = MiniJournal.Get(self.user)
        self.set_response({
            'journal': jrnl.json() if jrnl else None
        }, success=True)

    @authorized.role('user')
    def submit(self, d):
        '''
        Submit today's journal (yesterday if 00:00 - 04:00)
        '''
        date = None
        _date = self.request.get('date')
        if _date:
            date = tools.fromISODate(_date)
        task_json = tools.getJson(self.request.get('tasks'))  # JSON
        params = tools.gets(self,
            strings=['lat', 'lon', 'tags_from_text'],
            json=['data'],
            lists=['tags']
        )
        logging.debug(params)
        if params.get('data'):
            if not params.get('tags'):
                params['tags'] = []
            jrnl = MiniJournal.Create(self.user, date)
            jrnl.Update(**params)
            jrnl.parse_tags()
            jrnl.put()

            if task_json:
                # Save new tasks for tomorrow
                tasks = []
                due = self._get_task_due_date()
                for t in task_json:
                    if t:
                        task = Task.Create(self.user, t, due=due)
                        tasks.append(task)
                ndb.put_multi(tasks)
            self.success = True

        self.set_response({
            'journal': jrnl.json() if jrnl else None
        })

    def _get_task_due_date(self):
        now = datetime.now()
        return datetime.combine((now + timedelta(hours=24+8)).date(), time(0,0))


class SnapshotAPI(handlers.JsonRequestHandler):

    @authorized.role('user')
    def list(self, d):
        limit = self.request.get_range('limit', default=500)
        snapshots = Snapshot.Recent(self.user, limit=limit)
        self.set_response({
            'snapshots': [s.json() for s in snapshots if s]
            }, success=True, debug=True)

    @authorized.role('user')
    def submit(self, d):
        '''
        Submit a snapshot. Assume snapshot is now
        '''
        params = tools.gets(self,
            strings=['lat', 'lon', 'activity', 'where'],
            json=['metrics'],
            lists=['people']
        )
        snap = Snapshot.Create(self.user, **params)
        snap.put()
        self.success = True
        self.set_response({
            'snapshot': snap.json() if snap else None
        }, message="Snapshot submitted!", debug=True)


class TrackingAPI(handlers.JsonRequestHandler):

    @authorized.role('user')
    def update(self, d):
        '''
        Update a single TrackingDay() object with properties
        defined via JSON key(str) -> value(str)
        '''
        date = None
        _date = self.request.get('date')
        if _date:
            date = tools.fromISODate(_date)
        data_json = tools.getJson(self.request.get('data'))  # JSON
        td = TrackingDay.Create(self.user, date)  # Get or create
        if data_json:
            td.set_properties(data_json)
            td.put()
        self.success = True
        self.set_response({
            'tracking_day': td.json() if td else None
        })


class UserAPI(handlers.JsonRequestHandler):
    @authorized.role('admin')
    def list(self, d):
        page, max, offset = tools.paging_params(self)
        users = User.query().fetch(limit=max, offset=offset)
        self.success = True
        self.set_response({'users': [u.json() for u in users]})

    @authorized.role('user')
    def update_self(self, d):
        params = tools.gets(self,
                            strings=['timezone', 'birthday', 'password'],
                            lists=['sync_services'],
                            json=['settings'])
        logging.debug(params)
        self.user.Update(**params)
        self.user.put()
        self.update_session_user(self.user)
        message = "User settings updated"
        self.success = True
        self.set_response({
            'message': message,
            'user': self.user.json()
        }, debug=True)


class AuthenticationAPI(handlers.JsonRequestHandler):
    def google_login(self):
        from constants import ADMIN_EMAIL
        token = self.request.get('token')
        ok, _email, name = self.validate_google_id_token(token)
        u = None
        if ok:
            u = User.GetByEmail(_email)
            if not u:
                u = User.Create(email=_email, name=name)
                u.put()
            if u:
                self.update_session_user(u)
                self.login_dt = datetime.now()
                self.success = True
                self.message = "Signed in"
        else:
            self.message = "Failed to validate"
        self.set_response({'user': u.json() if u else None})

    def google_auth(self):
        client_id = self.request.get('client_id')
        redirect_uri = self.request.get('redirect_uri')
        state = self.request.get('state')
        id_token = self.request.get('id_token')
        redir_url = user = None
        if client_id == 'google':
            # Part of Google Home / API.AI auth flow
            if redirect_uri == "https://oauth-redirect.googleusercontent.com/r/%s" % secrets.GOOGLE_PROJECT_ID:
                if not user:
                    ok, _email, name = self.validate_google_id_token(id_token)
                    if ok:
                        user = User.GetByEmail(_email, create_if_missing=True, name=name)
                if user:
                    access_token = user.aes_access_token(client_id='google')
                    redir_url = 'https://oauth-redirect.googleusercontent.com/r/%s#' % secrets.GOOGLE_PROJECT_ID
                    redir_url += urllib.urlencode({
                        'access_token': access_token,
                        'token_type': 'bearer',
                        'state': state
                    })
                    self.success = True
            else:
                self.message = "Malformed"
        else:
            self.message = "Malformed"
        self.set_response({'redirect': redir_url}, debug=True)

    @authorized.role('user')
    def google_service_authenticate(self, service_name, d):
        data = {}
        if service_name == 'fit':
            from services.gfit import FitClient
            service = FitClient(self.user)
            uri = service.get_auth_uri()
            data['uri'] = uri
            self.success = True
        elif service_name == 'bigquery':
            from services.flow_bigquery import BigQueryClient
            service = BigQueryClient(self.user)
            uri = service.get_auth_uri()
            data['uri'] = uri
            self.success = True
        else:
            self.message = "Unknown service: %s" % service_name
        self.set_response(data)

    @authorized.role('user')
    def google_oauth2_callback(self, d):
        '''
        Handle server-side oauth2 callback
        '''
        error = self.request.get('error')
        code = self.request.get('code')
        scope = self.request.get('scope')
        # state_scopes = self.request.get('state')
        if code:
            from settings.secrets import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
            from constants import SECURE_BASE
            base = 'http://localhost:8080' if tools.on_dev_server() else SECURE_BASE
            credentials = client.credentials_from_code(
                GOOGLE_CLIENT_ID,
                GOOGLE_CLIENT_SECRET,
                scope,
                code,
                redirect_uri=base + "/api/auth/google/oauth2callback")
            if self.user:
                cr_json = credentials.to_json()
                logging.debug(type(cr_json))
                self.user.set_integration_prop('google_credentials', cr_json)
                self.user.put()
                self.update_session_user(self.user)
        elif error:
            logging.error(error)
        self.redirect("/app/integrations")

    def validate_google_id_token(self, token):
        from settings import secrets
        success = False
        email = name = None
        g_response = urlfetch.fetch("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=%s" % token)
        if g_response.status_code == 200:
            json_response = json.loads(g_response.content)
            if 'aud' in json_response:
                aud = json_response['aud']
                if aud == secrets.GOOGLE_CLIENT_ID:
                    success = True
                    email = json_response.get("email", None)
                    name = json_response.get("name", None)
                else:
                    logging.error("Client ID mismatch")
        return (success, email, name)

    def fbook_auth(self):
        id_token = self.request.get('id_token')
        account_linking_token = self.request.get('account_linking_token')
        redirect_uri = self.request.get('redirect_uri')
        res = {}
        user = None
        ok, _email, name = self.validate_google_id_token(id_token)
        if ok:
            user = User.GetByEmail(_email, create_if_missing=True, name=name)
        if user:
            auth_code = user.key.id()
            if redirect_uri:
                redirect_uri += '&authorization_code=%s' % auth_code
                self.success = True
            else:
                self.message = "No redirect URI?"
        else:
            self.message = "User not found"
        res['redirect'] = redirect_uri
        self.set_response(res, debug=True)

    def logout(self):
        self.signout()
        self.success = True
        self.message = "Signed out"
        self.set_response()


class AnalysisAPI(handlers.JsonRequestHandler):
    @authorized.role('user')
    def get(self, d):
        # TODO: Async fetches
        with_habits = self.request.get_range('with_habits', default=0) == 1
        with_tracking = self.request.get_range('with_tracking', default=1) == 1
        with_goals = self.request.get_range('with_goals', default=1) == 1
        with_tasks = self.request.get_range('with_tasks', default=1) == 1
        date_start = self.request.get('date_start')
        date_end = self.request.get('date_end')
        dt_start, dt_end = tools.fromISODate(date_start), tools.fromISODate(date_end)
        iso_dates = []
        habits = []
        today = datetime.today()
        habitdays = []
        goals = []
        journals, iso_dates = MiniJournal.Fetch(self.user, dt_start, dt_end)
        if with_habits:
            habits = Habit.Active(self.user)
            habitdays = HabitDay.Range(self.user, habits, dt_start, dt_end)
        if with_tracking:
            tracking_days = TrackingDay.Range(self.user, dt_start, dt_end)
        if with_goals:
            goals = Goal.Year(self.user, today.year)
        if with_tasks:
            tasks = Task.DueInRange(self.user, dt_start, dt_end, limit=100)
        self.set_response({
            'dates': iso_dates,
            'journals': [j.json() for j in journals if j],
            'habits': [h.json() for h in habits],
            'goals': [g.json() for g in goals],
            'tasks': [t.json() for t in tasks],
            'tracking_days': [p.json() for p in tracking_days],
            'habitdays': tools.lookupDict(habitdays,
                    keyprop="key_id",
                    valueTransform=lambda hd: hd.json())

            }, success=True)


class IntegrationsAPI(handlers.JsonRequestHandler):

    @authorized.role('user')
    def update_integration_settings(self, d):
        props = self.request.get('props').split(',')
        for prop in props:
            val = self.request.get(prop)
            self.user.set_integration_prop(prop, val)
        self.user.put()
        self.update_session_user(self.user)
        self.message = "%d properties saved" % len(props)
        self.set_response({
            'user': self.user.json()
        }, success=True)

    @authorized.role('user')
    def goodreads_shelf(self, d):
        from services import goodreads
        self.success, readables = goodreads.get_books_on_shelf(self.user, shelf='currently-reading')
        if not self.success:
            self.message = "There was a problem - please make sure you've entered your Goodreads ID on the integrations page"
        self.set_response({
            'readables': [r.json() for r in readables]
        })

    @authorized.role('user')
    def pocket_sync(self, d):
        '''
        Sync from pocket since last sync
        '''
        from services import pocket
        TS_KEY = 'pocket_last_timestamp'  # Seconds
        access_token = self.user.get_integration_prop('pocket_access_token')
        init_sync_since = tools.unixtime(datetime.now() - timedelta(days=7), ms=False)
        last_timestamp = self.user.get_integration_prop(TS_KEY, init_sync_since)
        readables = []
        if access_token:
            self.success, readables, latest_timestamp = pocket.sync(self.user, access_token, last_timestamp)
            self.user.set_integration_prop(TS_KEY, latest_timestamp)
            self.user.put()
            self.update_session_user(self.user)
        else:
            self.message = "Please link your Pocket account from the integrations page"
        self.set_response({
            'readables': [r.json() for r in readables]
        })

    @authorized.role('user')
    def pocket_authenticate(self, d):
        '''
        Step 1
        '''
        from services import pocket
        code, redirect = pocket.get_request_token(self.request.host_url)
        if code:
            self.session['pocket_code'] = code
            self.success = True
        self.set_response({
            'redirect': redirect
        })

    @authorized.role('user')
    def pocket_authorize(self, d):
        '''
        Step 2
        '''
        from services import pocket
        access_token = pocket.get_access_token(self.session.get('pocket_code'))
        if access_token:
            logging.debug(access_token)
            self.user.set_integration_prop('pocket_access_token', access_token)
            self.user.put()
            self.update_session_user(self.user)
            self.success = True
        self.set_response({
            'user': self.user.json() if self.user else None
        })

    @authorized.role('user')
    def pocket_disconnect(self, d):
        '''
        '''
        self.user.set_integration_prop('pocket_access_token', None)
        self.user.put()
        self.update_session_user(self.user)
        self.set_response({
            'user': self.user.json() if self.user else None
        }, success=True)

    @authorized.role('user')
    def evernote_authenticate(self, d):
        '''
        Step 1
        '''
        from services import flow_evernote
        authorize_url = flow_evernote.get_request_token(self.user, self.request.host_url + "/app/integrations/evernote_connect")
        self.success = bool(authorize_url)
        self.set_response(data={
            'redirect': authorize_url
            }, debug=True)

    @authorized.role('user')
    def evernote_authorize(self, d):
        '''
        Step 2
        '''
        from services import flow_evernote
        ot = self.request.get('oauth_token')
        verifier = self.request.get('oauth_verifier')
        self.log_request_params()
        access_token, en_user_id = flow_evernote.get_access_token(self.user, ot, verifier)
        if access_token and en_user_id:
            self.user.set_integration_prop('evernote_access_token', access_token)
            self.user.evernote_id = str(en_user_id)
            self.user.put()
            self.update_session_user(self.user)
            self.success = True
        else:
            self.message = "Failed to complete connection with Evernote"
        self.set_response(data={
            'user': self.user.json()
            }, debug=True)

    @authorized.role('user')
    def evernote_disconnect(self, d):
        '''
        '''
        self.user.set_integration_prop('evernote_access_token', None)
        self.user.evernote_id = None
        self.user.put()
        self.update_session_user(self.user)
        self.set_response({
            'user': self.user.json() if self.user else None
        }, success=True)

    @authorized.role()
    def evernote_webhook(self, d):
        '''
        Evernote notifies us of a change

        Webhook request for note creation of the form:
        [base URL]/?userId=[user ID]&guid=[note GUID]&notebookGuid=[notebook GUID]&reason=create
        '''
        from services import flow_evernote
        from models import Quote
        ENABLED_REASONS = ['create']
        note_guid = self.request.get('guid')
        evernote_id = self.request.get('userId')
        notebook_guid = self.request.get('notebookGuid')
        reason = self.request.get('reason')
        data = {}
        if reason in ENABLED_REASONS:
            user = User.query().filter(User.evernote_id == evernote_id).get()
            if user:
                config_notebook_ids = user.get_integration_prop('evernote_notebook_ids').split(',') # Comma sep
                if not config_notebook_ids or notebook_guid in config_notebook_ids:
                    title, content, url = flow_evernote.get_note(user, note_guid)
                    if title and content:
                        # TODO: Tags (come in as guids)
                        q = Quote.Create(user, source=title, content=content)
                        q.Update(link=url)
                        q.put()
                        self.success = True
                    else:
                        self.message = "Failed to parse note"
                else:
                    logging.warning("Note from ignored notebook or user not found")
            else:
                logging.warning("User not found")
        else:
            logging.debug("Ignoring, reason: %s not enabled" % reason)
        self.set_response(data=data, debug=True)


class AgentAPI(handlers.JsonRequestHandler):

    @authorized.role('admin')
    def spoof(self, d):
        from services.agent import ConversationAgent, AGENT_FBOOK_MESSENGER
        ca = ConversationAgent(type=AGENT_FBOOK_MESSENGER, user=self.user)
        message = self.request.get('message')
        action, params = ca.parse_message(message)
        speech, data, end_convo = ca.respond_to_action(action, parameters=params)
        self.message = speech
        self.success = True
        self.set_response(debug=True)

    def _get_agent_type(self, body):
        # Facebook Messenger example
        # {u'lang': u'en', u'status': {u'errorType': u'success', u'code': 200}, u'timestamp': u'2017-03-13T14:01:49.275Z', u'sessionId': u'e6d8f9a7-4a70-4049-9214-2c61e88af68d', u'result': {u'parameters': {}, u'contexts': [{u'name': u'generic', u'parameters': {u'facebook_sender_id': u'1182039228580866'}, u'lifespan': 4}], u'resolvedQuery': u'how am i doing?', u'source': u'agent', u'score': 1.0, u'speech': u'', u'fulfillment': {u'messages': [{u'speech': u'Sure, checking', u'type': 0}], u'speech': u'Sure, checking'}, u'actionIncomplete': False, u'action': u'input.status_request', u'metadata': {u'intentId': u'308e5379-7d79-42dd-b66c-7c1d44e1c2fd', u'webhookForSlotFillingUsed': u'false', u'intentName': u'Flow Status Request', u'webhookUsed': u'true'}}, u'id': u'1de76809-1bc3-47f5-ae8e-b7003cdc0f7f', u'originalRequest': {u'source': u'facebook', u'data': {u'timestamp': 1489413704002.0, u'message': {u'text': u'how am i doing?', u'mid': u'mid.1489413704002:027a192309', u'seq': 5398}, u'recipient': {u'id': u'197271657425620'}, u'sender': {u'id': u'1182039228580866'}}}}
        # Google Assistant Example
        # {"id":"dd224f85-cc29-4d27-8100-e5c1a54766c4","timestamp":"2017-03-09T22:19:05.112Z","lang":"en","result":{"source":"agent","resolvedQuery":"GOOGLE_ASSISTANT_WELCOME","speech":"","action":"input.status_request","actionIncomplete":false,"parameters":{},"contexts":[{"name":"google_assistant_welcome","parameters":{},"lifespan":0}],"metadata":{"intentId":"308e5379-7d79-42dd-b66c-7c1d44e1c2fd","webhookUsed":"true","webhookForSlotFillingUsed":"false","intentName":"Genzai Status Request"},"fulfillment":{"speech":"","messages":[]},"score":1.0},"status":{"code":200,"errorType":"success"},"sessionId":"1489097945070","originalRequest":{"source":"google","data":{"surface":{"capabilities":[{"name":"actions.capability.AUDIO_OUTPUT"},{"name":"actions.capability.AUDIO_INPUT"}]},"inputs":[{"arguments":[],"intent":"assistant.intent.action.MAIN","raw_inputs":[{"query":"talk to genzai","input_type":2,"annotation_sets":[]}]}],"user":{"access_token":"KZiPjtEKbyzWTG/o76yWWPsPLdt+kk2i3kkIhkb8mPUMRJds5Tk6QH4HINydK4RN99Lib0X5OPncW7sYb8oAaA5W7VMtnvFaAsMl2VKRGhk=","user_id":"WrBcqMQhQT3X8INoUpiqFZyoALrSlgk4XSmgOTUtjy0="},"device":{},"conversation":{"conversation_id":"1489097945070","type":1}}}}
        from services.agent import AGENT_GOOGLE_ASST, AGENT_FBOOK_MESSENGER
        originalRequest = body.get('originalRequest', {})
        source = originalRequest.get('source')
        if source:
            return {
                'google': AGENT_GOOGLE_ASST,
                'facebook': AGENT_FBOOK_MESSENGER
            }.get(source)

    def _get_user(self, body):
        originalRequest = body.get('originalRequest', {})
        user = originalRequest.get('data', {}).get('user', {})
        access_token = user.get('access_token')
        if access_token:
            user_id = User.user_id_from_aes_access_token(access_token)
            if user_id:
                self.user = User.get_by_id(int(user_id))
        return self.user

    def _get_action_and_params(self, body):
        id = body.get('id')
        logging.debug("Processing agent request with id: %s" % id)
        result = body.get('result', {})
        action = result.get('action')
        parameters = result.get('parameters')
        logging.debug(["_get_action_and_params", id, action, parameters])
        return (id, action, parameters)

    @authorized.role()
    def apiai_request(self, d):
        '''

        '''
        auth_key = self.request.headers.get('Auth-Key')
        res = {'source': 'Flow'}
        speech = None
        end_convo = False
        data = {}
        if auth_key == secrets.API_AI_AUTH_KEY:
            body = tools.getJson(self.request.body)
            logging.debug(body)
            agent_type = self._get_agent_type(body)
            id, action, parameters = self._get_action_and_params(body)
            self._get_user(body)
            if action == 'input.disconnect':
                speech = "Alright, you've disconnected your Flow account"
                end_convo = True
                self.signout()  # Clear session
            else:
                from services.agent import ConversationAgent
                ca = ConversationAgent(type=agent_type, user=self.user)
                speech, data, end_convo = ca.respond_to_action(action, parameters=parameters)

        if not speech:
            speech = "Uh oh, something weird happened"
        res['speech'] = speech
        res['displayText'] = speech
        data['google'] = {
            'expect_user_response': not end_convo
        }
        res['data'] = data
        res['contextOut'] = []
        self.json_out(res, debug=True)

    @authorized.role()
    def fbook_request(self, d):
        '''
        Facebook Messenger request handling
        '''
        verify_token = self.request.get('hub.verify_token')
        hub_challenge = self.request.get('hub.challenge')
        if verify_token and verify_token == secrets.FB_VERIFY_TOKEN:
            if hub_challenge:
                self.response.out.write(hub_challenge)
                return

        from services.agent import FacebookAgent
        fa = FacebookAgent(self.request)
        fa.send_response()
        self.success = True
        self.json_out({})

    @authorized.role('user')
    def flowapp_request(self, d):
        from services.agent import ConversationAgent, AGENT_FLOW_APP
        ca = ConversationAgent(type=AGENT_FLOW_APP, user=self.user)
        message = self.request.get('message')
        action, params = ca.parse_message(message)
        speech, data, end_convo = ca.respond_to_action(action, parameters=params)
        data = {
            'reply': speech
        }
        self.set_response(data, success=True, debug=True)


class ReportAPI(handlers.JsonRequestHandler):
    @authorized.role('user')
    def list(self, d):
        _max = self.request.get_range('max', max_value=500, default=100)
        reports = Report.Fetch(self.user, limit=_max)
        data = {
            'reports': [r.json() for r in reports]
            }
        self.set_response(data=data, success=True)

    @authorized.role('user')
    def generate(self, d):
        from constants import REPORT
        from handlers import APIError
        from tasks import backgroundReportRun
        type = self.request.get_range('type')
        if not type:
            raise APIError("No type in report request")
        ftype = self.request.get_range('ftype', default=REPORT.CSV)
        specs_json = self.request.get('specs_json')
        specs = tools.getJson(specs_json)
        report = Report.Create(self.user, type=type, specs=specs, ftype=ftype)
        report.put()
        tools.safe_add_task(backgroundReportRun, report.key.urlsafe(), _queue="report-queue")
        self.set_response(success=True, message="%s generating..." % report.title, data={
            'report': report.json() if report else None
        })

    @authorized.role('user')
    def serve(self, d):
        import cloudstorage as gcs
        rkey = self.request.get('rkey')
        r = Report.GetAccessible(rkey, self.user, urlencoded_key=True)
        if r:
            if r.is_done() and r.gcs_files:
                gcsfn = r.gcs_files[0]
                if tools.on_dev_server():
                    try:
                        gcs_file = gcs.open(gcsfn, 'r')
                    except gcs.NotFoundError, e:
                        self.response.out.write("File not found")
                    else:
                        self.response.headers['Content-Type'] = Report.content_type(r.extension)
                        self.response.headers['Content-Disposition'] = str('attachment; filename="%s"' % r.filename())
                        self.response.write(gcs_file.read())
                        gcs_file.close()
                else:
                    signed_url = tools.sign_gcs_url(gcsfn, expires_after_seconds=5)
                    response = self.redirect(signed_url)
                    logging.info(response)
            else:
                self.set_response(success=False, status=404, message="Report not ready") # Not found
        else:
            self.response.out.write("Unauthorized")

    @authorized.role('user')
    def delete(self, d):
        rkey = self.request.get('rkey')
        r = Report.GetAccessible(rkey, self.user, urlencoded_key=True)
        if r:
            r.clean_delete(self_delete=True)
            self.message = "Report deleted"
            self.success = True
        else:
            self.message = "Report not found"
        self.set_response()

