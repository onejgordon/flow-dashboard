#!/usr/bin/python
# -*- coding: utf8 -*-

from datetime import datetime, timedelta
from base_test_case import BaseTestCase
from models import Readable, Quote, User
from flow import app as tst_app


class ReadableTestCase(BaseTestCase):

    def setUp(self):
        self.set_application(tst_app)
        self.setup_testbed()
        self.init_standard_stubs()

        u = User.Create(email="test@example.com")
        u.put()
        self.u = u

    def test_quote_readable_matching(self):
        volley = [
            ('1000', "Crony Beliefs", "Kevin Simler", "CRONY BELIEFS (SIMLER)", "I contend that the best way to understand all the crazy beliefs out there — aliens, conspiracies, and all the rest — is to analyze them as crony beliefs. Beliefs that have been \"hired\" not for the legitimate purpose of accurately modeling the world, but rather for social and political kickbacks."),
            ('1001', "Thinking in Systems: A Primer", "Donna H. Meadows", "THINKING IN SYSTEMS A PRIMER (MEADOWS)", "XXX."),
        ]

        for v in volley:
            source_id, title, author, exp_slug, content = v
            r = Readable.CreateOrUpdate(self.u, source_id, title=title, author=author, source="test")
            r.put()
            Readable.put_sd_batch([r])

            self.assertEqual(r.slug, exp_slug)

            author_names = author.split(' ')
            source = "%s (%s, %s)" % (title, author_names[-1], author_names[0])
            q = Quote.Create(self.u, source, content)
            q.put()
            self.assertIsNotNone(q.readable)
            self.assertEqual(q.readable, r.key)
            self.assertEqual(q.source_slug(), exp_slug)
            r = Readable.GetByTitleAuthor(self.u, author, title)
            self.assertIsNotNone(r)
            self.assertEqual(r.source_id, source_id)

        # Create another quote with no readable to link to
        q = Quote.Create(self.u, "xxx", "content...")
        q.put()

        self.assertIsNone(q.readable)

        # Fetch quotes for readable
        quotes = Quote.Fetch(self.u, readable_id=r.key.id())
        self.assertEqual(len(quotes), 1)
        self.assertEqual(quotes[0].source, source)


