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
        g = Goal.Create(u, date=datetime.today().date())
        g.Update(text=["Get it done", "Also get exercise"])
        g.put()

    def test_habit_calls(self):
        response = self.get_json("/api/habit", {}, headers=self.api_headers)
        h = response.get('habits')[0]
        self.assertEqual(h.get('name'), "Run")

    def test_goal_calls(self):
        response = self.get_json("/api/goal", {}, headers=self.api_headers)
        h = response.get('goals')[0]
        self.assertEqual(h.get('text')[0], "Get it done")

    def test_task_calls(self):
        response = self.get_json("/api/task", {}, headers=self.api_headers)
        h = response.get('tasks')[0]
        self.assertEqual(h.get('title'), "Dont forget the milk")
