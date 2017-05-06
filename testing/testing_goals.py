#!/usr/bin/python
# -*- coding: utf8 -*-

from datetime import datetime
from base_test_case import BaseTestCase
from models import Goal, User
from flow import app as tst_app


class GoalsTestCase(BaseTestCase):

    def setUp(self):
        self.set_application(tst_app)
        self.setup_testbed()
        self.init_standard_stubs()
        self.init_app_basics()
        u = self.users[0]
        self.goal_annual = Goal.Create(u, '2017')
        self.goal_annual.Update(text=["Annual goal 1", "Annual goal 2"])
        self.goal_monthly = Goal.CreateMonthly(u)
        self.goal_monthly.put()
        self.goal_annual.put()

    def test_types(self):
        self.assertTrue(self.goal_monthly.monthly())
        self.assertTrue(self.goal_annual.annual())
