#!/usr/bin/python
# -*- coding: utf8 -*-

from datetime import datetime, timedelta
from base_test_case import BaseTestCase
from models import Readable, Quote, User
from flow import app as tst_app
from mock import patch, MagicMock

CRONY_TITLE = "Crony Beliefs"
CRONY_AUTHOR = "Kevin Simler"
CRONY_QUOTE = "I contend that the best way to understand all the crazy beliefs out there - aliens, conspiracies, and all the rest - is to analyze them as crony beliefs. Beliefs that have been \"hired\" not for the legitimate purpose of accurately modeling the world, but rather for social and political kickbacks."
CRONY_URL = "http://www.meltingasphalt.com/crony-beliefs/"

MEDIUM_TITLE = "892 Ways to Instantly Win"
MEDIUM_URL = "http://www.medium.com/every_publication/any-post"
MEDIUM_FULL_CONTENT = """<?xml version="1.0" encoding="utf-8"?><!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd"><en-note><div style="-evernote-webclip:true"><br/><div style="white-space: nowrap;"><div style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; color: rgb(12, 12, 12); overflow-x: hidden; text-overflow: ellipsis; padding-bottom: 9px;">The Dream Job Is a Myth. Focus Instead on Living Your Best Life.</div><div style="border-top: 1px solid rgb(216, 216, 216); height: 0px; width: 100%;"></div><div style="position: relative; display: inline-block; margin: 15px 30px 0px 0px; overflow: hidden; vertical-align: top;"><en-media type="image/png" hash="291939111d0a2e1da1283e8d08c8d7c9" style="max-width: none; max-height: none; vertical-align: top; margin: 0px; padding: 0px;" width="150" height="150"></en-media></div><div style="display: inline-block; vertical-align: top; margin: 15px 0px 0px; width: 364px;"><div style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: rgb(12, 12, 12); display: block;"><en-media type="image/png" hash="fd4f03bacfca94cbcdef389cc3ec2191" width="16" height="16" style="display: inline-block; border: none; width: 16px; height: 16px; padding: 0px; margin: 0px 8px -2px 0px;"></en-media><a href="https://www.entrepreneur.com/article/292821" style="display: inline-block; text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: rgb(12, 12, 12); width: 345px;">https://www.entrepreneur.com/article/292821</a></div><div style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: rgb(12, 12, 12); display: block; white-space: normal; margin-top: 15px; max-height: 154px; overflow: hidden;">You find your true calling by explore opportunities for happiness and growth.</div></div></div><br/></div></en-note>"""


class ReadableTestCase(BaseTestCase):

    def setUp(self):
        self.set_application(tst_app)
        self.setup_testbed()
        self.init_standard_stubs()
        self.init_app_basics()

        self.u = self.users[0]

    def test_quote_readable_matching(self):
        volley = [
            ('1000', CRONY_TITLE, CRONY_AUTHOR, "CRONY BELIEFS (SIMLER)", CRONY_QUOTE),
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

    @patch('services.flow_evernote.get_note')
    def test_evernote_webhook(self, get_note_mocked):
        EN_NOTE_GUID = "1000-0815-aefe-b8a0-8888"
        EN_USER_ID = "1001"
        EN_NOTEBOOK_ID = "ffff-0000"

        self.u.evernote_id = EN_USER_ID
        self.u.set_integration_prop('evernote_notebook_ids', EN_NOTEBOOK_ID)
        self.u.put()

        # Test article clip
        # Mock return from Evernote service
        get_note_mocked.return_value = (EN_NOTE_GUID, MEDIUM_TITLE, MEDIUM_FULL_CONTENT, MEDIUM_URL)

        self.get_json("/api/integrations/evernote/webhook", {
            'reason': 'create',
            'guid': EN_NOTE_GUID,
            'notebookGuid': EN_NOTEBOOK_ID,
            'userId': self.u.evernote_id
        }, headers=self.api_headers)
        readables = Readable.Fetch(self.u)
        self.assertEqual(len(readables), 1)
        r = readables[0]
        self.assertEqual(r.title, MEDIUM_TITLE)
        self.assertEqual(r.url, MEDIUM_URL)

        # Test quote/excerpt clip
        get_note_mocked.return_value = (EN_NOTE_GUID, CRONY_TITLE, CRONY_QUOTE, CRONY_URL)

        self.get_json("/api/integrations/evernote/webhook", {
            'reason': 'create',
            'guid': EN_NOTE_GUID,
            'notebookGuid': EN_NOTEBOOK_ID,
            'userId': self.u.evernote_id
        }, headers=self.api_headers)
        quotes = Quote.Fetch(self.u)
        self.assertEqual(len(quotes), 1)
        q = quotes[0]
        self.assertEqual(q.source, CRONY_TITLE)
        self.assertEqual(q.content, CRONY_QUOTE)


