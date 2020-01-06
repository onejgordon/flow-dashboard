#!/usr/bin/python
# -*- coding: utf8 -*-

from datetime import datetime, timedelta
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

        habit_read = Habit.Create(u)
        habit_read.Update(name="Read")
        habit_read.put()
        self.habit_read = habit_read

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

    def test_retrieve_history(self):
        # Toggle today and yesterday (create 2 habitdays)
        marked_done, hd = HabitDay.Toggle(self.habit_read, datetime.today())
        marked_done, hd = HabitDay.Toggle(self.habit_read, datetime.today() - timedelta(days=1))
        hd_keys = HabitDay.All(self.habit_read.key)
        self.assertEqual(len(hd_keys), 2)

    def test_delete_history(self):
        marked_done, hd = HabitDay.Toggle(self.habit_read, datetime.today())
        marked_done, hd = HabitDay.Toggle(self.habit_run, datetime.today())

        self.habit_read.delete_history()  # Schedules background task
        self.execute_tasks_until_empty()
        hd_keys = HabitDay.All(self.habit_read.key)
        self.assertEqual(len(hd_keys), 0)  # Confirm both deleted

        # Confirm habit_run not affected
        hd_keys = HabitDay.All(self.habit_run.key)
        self.assertEqual(len(hd_keys), 1)  # Confirm still in db

