#!/usr/bin/python
# -*- coding: utf8 -*-

from datetime import datetime
from base_test_case import BaseTestCase
from models import Project, User
from flow import app as tst_app


class ProjectsTestCase(BaseTestCase):

    def setUp(self):
        self.set_application(tst_app)
        self.setup_testbed()
        self.init_datastore_stub()
        self.init_memcache_stub()
        self.init_taskqueue_stub()
        self.init_mail_stub()
        self.register_search_api_stub()

        u = User.Create(email="test@example.com")
        u.put()

        self.project = Project.Create(u)
        self.project.Update(title="Build App", subhead="Subhead", urls=["http://www.example.com"])
        self.project.put()

    def test_setting_progress(self):
        set_progresses = [4, 6, 10]
        for p in set_progresses:
            self.project.set_progress(p)
        self.project.put()

        progress_ts = self.project.progress_ts
        for p in set_progresses:
            self.assertTrue(progress_ts[p-1] > 0)
        self.assertTrue(self.project.is_completed())
        self.assertIsNotNone(self.project.dt_completed)
