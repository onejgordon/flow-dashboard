#!/usr/bin/python
# -*- coding: utf8 -*-

from datetime import datetime
from base_test_case import BaseTestCase
from models import Habit, HabitDay
from flow import app as tst_app


class HabitTestCase(BaseTestCase):

    def setUp(self):
        self.set_application(tst_app)
        self.setup_testbed()
        self.init_datastore_stub()
        self.init_memcache_stub()
        self.init_taskqueue_stub()
        self.init_mail_stub()
        self.init_app_basics()
        self.register_search_api_stub()

        u = self.users[0]
        habit_run = Habit.Create(u)
        habit_run.Update(name="Run")
        habit_run.put()
        self.habit_run = habit_run

    def test_toggle(self):
        # Mark done (creating new habit day)
        marked_done, hd = HabitDay.Toggle(self.habit_run, datetime.today())
        self.assertTrue(marked_done)
        self.assertIsNotNone(hd)
        self.assertTrue(hd.done)

        # Mark not done
        marked_done, hd = HabitDay.Toggle(self.habit_run, datetime.today())
        self.assertFalse(marked_done)
        self.assertIsNotNone(hd)
        self.assertFalse(hd.done)

