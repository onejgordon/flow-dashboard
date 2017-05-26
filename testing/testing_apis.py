#!/usr/bin/python
# -*- coding: utf8 -*-

from datetime import datetime, timedelta
from base_test_case import BaseTestCase
from models import Goal
from flow import app as tst_app
from constants import USER, TASK
from models import Habit, Task, Project, Event, Readable, Quote, Snapshot
from services.agent import ConversationAgent
import json
import tools


class APITestCase(BaseTestCase):

    def setUp(self):
        self.set_application(tst_app)
        self.setup_testbed()
        self.init_datastore_stub()
        self.init_memcache_stub()
        self.init_taskqueue_stub()
        self.init_mail_stub()
        self.register_search_api_stub()
        self.init_app_basics()

        self.u = u = self.users[0]
        self.u.Update(name="George")
        self.u.put()
        h = Habit.Create(u)
        h.Update(name="Run")
        h.put()
        t = Task.Create(u, "Dont forget the milk")
        t.put()
        g = Goal.CreateMonthly(u, date=datetime.today().date())
        g.Update(text=["Get it done", "Also get exercise"])
        g.put()

    def test_user_calls(self):
        # Update self
        DOB = '1985-10-21'
        TZ = 'Africa/Nairobi'
        response = self.post_json("/api/user/me", {
            'timezone': TZ,
            'birthday': DOB
            }, headers=self.api_headers)
        u = response.get('user')
        self.assertIsNotNone(u)
        self.assertEqual(u.get('birthday'), DOB)
        self.assertEqual(u.get('timezone'), TZ)

    def test_habit_calls(self):
        # List
        response = self.get_json("/api/habit", {}, headers=self.api_headers)
        h = response.get('habits')[0]
        self.assertEqual(h.get('name'), "Run")

        # Update
        response = self.post_json("/api/habit", {'id': h.get('id'), 'name': 'Walk'}, headers=self.api_headers)
        h = response.get('habit')
        self.assertEqual(h.get('name'), 'Walk')

        # Actions
        today = datetime.now()
        DAY = tools.iso_date(today - timedelta(days=1))
        hid = h.get('id')
        actions = [
            {'action': 'commit', 'expected_prop': 'committed'},
            {'action': 'toggle', 'expected_prop': 'done'}
        ]
        for act in actions:
            params = {
                'habit_id': hid,
                'date': DAY
            }
            response = self.post_json("/api/habit/%s" % act.get('action'), params, headers=self.api_headers)
            hd = response.get('habitday')
            prop = act.get('expected_prop')
            self.assertTrue(hd.get(prop))

        # Recent
        response = self.get_json("/api/habit/recent", {'days': 3}, headers=self.api_headers)
        habitdays = response.get('habitdays')
        self.assertTrue(hd.get('id') in habitdays)

        # Recent
        params = {
            'start_date': tools.iso_date(today - timedelta(days=2)),
            'end_date': tools.iso_date(today)
        }
        response = self.get_json("/api/habit/range", params, headers=self.api_headers)
        habitdays = response.get('habitdays')
        self.assertTrue(hd.get('id') in habitdays)

        # Delete
        response = self.post_json("/api/habit/delete", {'id': h.get('id')}, headers=self.api_headers)
        h = Habit.get_by_id(h.get('id'), parent=self.u.key)
        self.assertIsNone(h)  # Confirm deletion

    def test_goal_calls(self):
        response = self.get_json("/api/goal", {}, headers=self.api_headers)
        goal = response.get('goals')[0]
        self.assertEqual(goal.get('text')[0], "Get it done")

        # Update
        response = self.post_json("/api/goal", {'id': goal.get('id'), 'text': json.dumps(['New goal 1', u'New goal 2 with unicode. ありがとう'])}, headers=self.api_headers)
        goal = response.get('goal')
        self.assertEqual(goal.get('text')[0], 'New goal 1')
        self.assertEqual(goal.get('text')[1], u'New goal 2 with unicode. ありがとう')

    def test_task_calls(self):
        response = self.get_json("/api/task", {}, headers=self.api_headers)
        h = response.get('tasks')[0]
        self.assertEqual(h.get('title'), "Dont forget the milk")

        # Update
        response = self.post_json("/api/task", {'id': h.get('id'), 'title': 'Dont forget the sugar', 'status': TASK.DONE}, headers=self.api_headers)
        task = response.get('task')
        task_id = task.get('id')
        self.assertEqual(task.get('title'), 'Dont forget the sugar')
        self.assertEqual(task.get('status'), TASK.DONE)

        # Archive complete
        response = self.post_json("/api/task/action", {'action': 'archive_complete'}, headers=self.api_headers)
        task = self.u.get(Task, id=task_id)
        self.assertTrue(task.archived)

        # Delete
        response = self.post_json("/api/task/delete", {'id': h.get('id')}, headers=self.api_headers)
        task = self.u.get(Task, id=task.key.id())
        self.assertIsNone(task)  # Confirm deletion

    def test_project_calls(self):
        p = Project.Create(self.u)
        p.Update(urls=['http://www.x.com', 'http://www.y.com'],
                 title="New Project",
                 subhead="Details")
        p.put()

        # List
        response = self.get_json("/api/project", {}, headers=self.api_headers)
        prj = response.get('projects')[0]
        self.assertEqual(prj.get('title'), "New Project")

        # Update
        response = self.post_json("/api/project", {'id': prj.get('id'), 'title': 'New Name', 'due': '2018-01-01'}, headers=self.api_headers)
        prj = response.get('project')
        self.assertEqual(prj.get('title'), 'New Name')
        self.assertEqual(prj.get('due'), '2018-01-01')

        # Delete
        response = self.post_json("/api/project/delete", {'id': prj.get('id')}, headers=self.api_headers)
        prj = self.u.get(Project, id=prj.get('id'))
        self.assertIsNone(prj)  # Confirm deletion

    def test_event_calls(self):
        date_start = datetime.today()
        e = Event.Create(self.u, date_start)
        e.Update(title="New Event",
                 details="Details")
        e.put()

        self.assertEqual(e.title, "New Event")
        self.assertEqual(e.details, "Details")

        # Batch create
        params = {'events': json.dumps([
            {'title': "Batch event 1", 'date_start': '2017-01-01', 'date_end': '2017-02-01'},
            {'title': "Batch event 2", 'date_start': '2017-04-04', 'date_end': '2017-04-06'},
            {'title': "Batch event 3", 'date_start': '2017-05-01', 'date_end': '2017-05-20'}
        ])}
        response = self.post_json("/api/event/batch", params, headers=self.api_headers)
        message = response.get('message')
        self.assertEqual(message, "Creating 3 event(s)")

        # List
        response = self.get_json("/api/event", {}, headers=self.api_headers)
        h = response.get('events')[-1]
        self.assertEqual(h.get('title'), "New Event")

        # Update
        response = self.post_json("/api/event", {'id': h.get('id'), 'title': 'New Name'}, headers=self.api_headers)
        h = response.get('event')
        self.assertEqual(h.get('title'), 'New Name')

        # Delete
        response = self.post_json("/api/event/delete", {'id': h.get('id')}, headers=self.api_headers)
        h = self.u.get(Event, id=h.get('id'))
        self.assertIsNone(h)  # Confirm deletion

    def test_readable_calls(self):
        # Create
        r = Readable.CreateOrUpdate(self.u, '1234', title="An Article", source='x', url="http://www.nytimes.com/1")
        r.put()

        self.assertEqual(r.title, "An Article")
        self.assertEqual(r.url, "http://www.nytimes.com/1")

        # List
        response = self.get_json("/api/readable", {}, headers=self.api_headers)
        r = response.get('readables')[0]
        self.assertEqual(r.get('title'), "An Article")

        # Update
        params = {
            'id': r.get('id'),
            'title': 'New Article Name',
            'author': "Andy Clark",
            'source': "New Source",
            'excerpt': "Excerpt...",
            'notes': "Notes...",
            'word_count': 1850,
            'url': 'http://www.example.com'
        }
        response = self.post_json("/api/readable", params, headers=self.api_headers)
        r = response.get('readable')
        for key, val in params.items():
            self.assertEqual(r.get(key), val)

        # Search
        response = self.get_json("/api/readable/search", {'term': "clark"}, headers=self.api_headers)
        readables = response.get('readables')
        self.assertEqual(len(readables), 1)

        # Delete
        response = self.post_json("/api/readable/delete", {'id': r.get('id')}, headers=self.api_headers)
        r = self.u.get(Readable, id=r.get('id'))
        self.assertIsNone(r)  # Confirm deletion

    def test_quote_calls(self):
        # Create
        q = Quote.Create(self.u, 'Overheard', "I think therefore I am")
        q.put()

        self.assertEqual(q.content, "I think therefore I am")
        self.assertEqual(q.source, "Overheard")

        # List
        response = self.get_json("/api/quote", {}, headers=self.api_headers)
        q = response.get('quotes')[0]
        self.assertEqual(q.get('content'), "I think therefore I am")

        # Update
        params = {
            'id': q.get('id'),
            'source': 'Somewhere else',
            'content': "I think therefore I'm not",
            'link': 'http://www.example.com',
            'location': 'Location 100 of 1200',
            'tags': 'tag1,tag2'
        }
        response = self.post_json("/api/quote", params, headers=self.api_headers)
        q = response.get('quote')
        for key, val in params.items():
            if key == 'tags':
                self.assertEqual(q.get(key), val.split(','))
            else:
                self.assertEqual(q.get(key), val)

        # Search
        response = self.get_json("/api/quote/search", {'term': "think"}, headers=self.api_headers)
        quotes = response.get('quotes')
        self.assertEqual(len(quotes), 1)

    def test_journal_calls(self):
        # Create / Submit
        params = {
            'data': json.dumps({
                'metric1': 10
            })
        }
        response = self.post_json("/api/journal/submit", params, headers=self.api_headers)
        jrnl = response.get('journal')
        self.assertIsNotNone(jrnl)

        # Update
        params = {
            'id': jrnl.get('id'),
            'data': json.dumps({
                'metric1': 20
            })
        }
        response = self.post_json("/api/journal", params, headers=self.api_headers)
        jrnl = response.get('journal')
        self.assertIsNotNone(jrnl)
        self.assertEqual(jrnl.get('data').get('metric1'), 20)

        # Today
        response = self.get_json("/api/journal/today", {}, headers=self.api_headers)
        today_jrnl = response.get('journal')
        self.assertEqual(today_jrnl.get('id'), jrnl.get('id'))

        # List
        response = self.get_json("/api/journal", {}, headers=self.api_headers)
        listed_jrnls = response.get('journals')
        self.assertEqual(len(listed_jrnls), 1)
        self.assertEqual(listed_jrnls[0].get('id'), jrnl.get('id'))

    def test_snapshot_calls(self):
        # Create
        snap = Snapshot.Create(self.u, activity="Eating", place="Restaurant", people=["Elizabeth"],
                               metrics={'stress': 2})
        snap.put()

        self.assertEqual(snap.get_data_value('stress'), 2)
        self.assertEqual(snap.activity, "Eating")

        # List
        response = self.get_json("/api/snapshot", {}, headers=self.api_headers)
        snap = response.get('snapshots')[0]
        print response
        self.assertEqual(snap.get('activity'), "Eating")

    def test_tracking_calls(self):
        # Post an update to the tracking object for Jan 1, 2017
        DATE = "2017-01-01"
        response = self.post_json("/api/tracking", {'date': DATE, 'data': json.dumps({'foo': 'bar'})}, headers=self.api_headers)
        td = response.get('tracking_day')
        self.assertIsNotNone(td)
        self.assertEqual(td.get('iso_date'), DATE)
        self.assertEqual(td.get('data', {}).get('foo'), 'bar')

        # Malformed request with no date
        response = self.post_json("/api/tracking", {'data': json.dumps({'foo': 'bar'})}, headers=self.api_headers)
        self.assertFalse(response.get('success'))

    def test_flowapp_agent_api(self):
        response = self.post_json("/api/agent/flowapp/request", {'message': "hi"}, headers=self.api_headers)
        reply = response.get('reply')
        self.assertTrue(reply in ConversationAgent.HELLO_BANTER)

