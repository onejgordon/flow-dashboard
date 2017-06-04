#!/usr/bin/python
# -*- coding: utf8 -*-

from google.appengine.ext import db
from google.appengine.ext import testbed
from datetime import datetime
from models import User
from base_test_case import BaseTestCase
from flow import app as tst_app
import tools
import imp
try:
    imp.find_module('secrets', ['settings'])
except ImportError:
    from settings import secrets_template as secrets
else:
    from settings import secrets

USER_GOOGLE_ID = "1234"


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

    def testUserGoogleSimpleAccountLinking(self):
        import jwt
        user = User.Create(email="test@example.com", g_id=USER_GOOGLE_ID)
        user.put()

        creation = int(tools.unixtime(ms=False))
        payload = {
            'iss': 'https://accounts.google.com',
            'aud': secrets.GOOGLE_CLIENT_ID,
            'sub': USER_GOOGLE_ID,
            'email': "test@example.com",
            'locale': "en_US",
            "iat": creation,
            "exp": creation + 60*60
        }
        params = {
            'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'intent': 'get',
            'assertion': jwt.encode(payload, secrets.GOOGLE_CLIENT_SECRET, algorithm='HS256')
        }
        response = self.post_json("/api/auth/google/token", params)
        token_type = response.get('token_type')
        self.assertEqual(token_type, 'bearer')

