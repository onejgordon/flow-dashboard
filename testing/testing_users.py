#!/usr/bin/python
# -*- coding: utf8 -*-

from datetime import datetime
from base_test_case import BaseTestCase
from models import Project, User
from flow import app as tst_app
from datetime import timedelta


class UsersTestCase(BaseTestCase):

    def setUp(self):
        self.set_application(tst_app)
        self.setup_testbed()
        self.init_datastore_stub()
        self.init_memcache_stub()
        self.init_taskqueue_stub()
        self.init_mail_stub()
        self.register_search_api_stub()
        self.init_app_basics()

    def test_local_time(self):
        u = self.users[0]
        u.timezone = "Africa/Nairobi"
        u.put()

        utc_now = datetime.now()
        self.assertEqual(u.local_time().hour, (utc_now + timedelta(hours=3)).hour)

