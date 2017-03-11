#!/usr/bin/python
# -*- coding: utf8 -*-

from google.appengine.ext import db
from google.appengine.ext import testbed
from datetime import datetime
from models import User
from base_test_case import BaseTestCase
from flow import app as tst_app


class AuthenticationTestCase(BaseTestCase):

    def setUp(self):
        self.set_application(tst_app)
        self.setup_testbed()
        self.init_datastore_stub()
        self.init_memcache_stub()
        self.init_taskqueue_stub()
        self.register_search_api_stub()
        self.init_mail_stub()

    def testUserAccessEncodeDecode(self):
        user = User.Create(email="test@example.com")
        user.put()
        access_token = user.aes_access_token(client_id="test")
        user_id = User.user_id_from_aes_access_token(access_token)
        self.assertIsNotNone(access_token)
        self.assertEqual(user_id, user.key.id())
