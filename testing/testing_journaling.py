#!/usr/bin/python
# -*- coding: utf8 -*-

from google.appengine.api import memcache
from google.appengine.ext import db
from google.appengine.ext import testbed
from datetime import datetime, timedelta
from google.appengine.ext import deferred
from base_test_case import BaseTestCase
from models import JournalTag, MiniJournal, User
from flow import app as tst_app


class JournalingTestCase(BaseTestCase):

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
        self.u = u

    def test_journal_tag_parsign(self):
        volley = [
            ("Fun #PoolParty with @KatyRoth", ["#PoolParty"], ["@KatyRoth"]),
            ("Stressful day at work with @BarackObama", [], ["@BarackObama"]),
            ("Went #Fishing with @JohnKariuki and got #Sick off #Seafood", ["#Fishing", "#Sick", "#Seafood"], ["@JohnKariuki"]),
            ("Went #Fishing with @BarackObama", ["#Fishing"], ["@BarackObama"])
        ]
        for v in volley:
            txt, expected_hashes, expected_people = v
            jts = JournalTag.CreateFromText(self.u, txt)
            hashes = map(lambda jt: jt.key.id(), filter(lambda jt: not jt.person(), jts))
            people = map(lambda jt: jt.key.id(), filter(lambda jt: jt.person(), jts))
            self.assertEqual(expected_hashes, hashes)
            self.assertEqual(expected_people, people)

        self.assertEqual(len(JournalTag.All(self.u)), 7)


