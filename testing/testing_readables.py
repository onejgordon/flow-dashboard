#!/usr/bin/python
# -*- coding: utf8 -*-

from datetime import datetime, timedelta
from base_test_case import BaseTestCase
from models import Readable, Quote, User
from flow import app as tst_app

R_SOURCE_ID = '1234'


class ReadableTestCase(BaseTestCase):

    def setUp(self):
        self.set_application(tst_app)
        self.setup_testbed()
        self.init_standard_stubs()

        u = User.Create(email="test@example.com")
        u.put()
        self.u = u

    def test_quote_readable_matching(self):
        title = "Crony Beliefs"
        author = "Kevin Simler"
        r = Readable.CreateOrUpdate(self.u, R_SOURCE_ID, title=title, author=author, source="test")
        r.put()

        EXPECTED_SLUG = "CRONY BELIEFS (SIMLER)"

        self.assertEqual(r.slug, EXPECTED_SLUG)

        source = "Crony Beliefs (Simler, Kevin)"
        content = "I contend that the best way to understand all the crazy beliefs out there — aliens, conspiracies, and all the rest — is to analyze them as crony beliefs. Beliefs that have been \"hired\" not for the legitimate purpose of accurately modeling the world, but rather for social and political kickbacks."
        q = Quote.Create(self.u, source, content)
        q.put()
        self.assertIsNotNone(q.readable)
        self.assertEqual(q.readable, r.key)

        self.assertEqual(q.source_slug(), EXPECTED_SLUG)

        r = Readable.GetByTitleAuthor(self.u, author, title)
        self.assertIsNotNone(r)
        self.assertEqual(r.source_id, R_SOURCE_ID)




