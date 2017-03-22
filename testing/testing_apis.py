#!/usr/bin/python
# -*- coding: utf8 -*-

from datetime import datetime
from base_test_case import BaseTestCase
from models import Goal
from flow import app as tst_app
from models import Habit, Task
import json


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

    def test_habit_calls(self):
        # List
        response = self.get_json("/api/habit", {}, headers=self.api_headers)
        h = response.get('habits')[0]
        self.assertEqual(h.get('name'), "Run")

        # Update
        response = self.post_json("/api/habit", {'id': h.get('id'), 'name': 'Walk'}, headers=self.api_headers)
        h = response.get('habit')
        self.assertEqual(h.get('name'), 'Walk')

        # Delete
        response = self.post_json("/api/habit/delete", {'id': h.get('id')}, headers=self.api_headers)
        h = Habit.get_by_id(h.get('id'), parent=self.u.key)
        self.assertIsNone(h)  # Confirm deletion

    def test_goal_calls(self):
        response = self.get_json("/api/goal", {}, headers=self.api_headers)
        goal = response.get('goals')[0]
        self.assertEqual(goal.get('text')[0], "Get it done")

        # Update
        response = self.post_json("/api/goal", {'id': goal.get('id'), 'text1': 'New goal 1', 'text2': 'New goal 2'}, headers=self.api_headers)
        goal = response.get('goal')
        self.assertEqual(goal.get('text')[0], 'New goal 1')
        self.assertEqual(goal.get('text')[1], 'New goal 2')

    def test_task_calls(self):
        response = self.get_json("/api/task", {}, headers=self.api_headers)
        h = response.get('tasks')[0]
        self.assertEqual(h.get('title'), "Dont forget the milk")

        # Update
        response = self.post_json("/api/task", {'id': h.get('id'), 'title': 'Dont forget the sugar'}, headers=self.api_headers)
        task = response.get('task')
        self.assertEqual(task.get('title'), 'Dont forget the sugar')

