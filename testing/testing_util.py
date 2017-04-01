#!/usr/bin/python
# -*- coding: utf8 -*-

from google.appengine.api import memcache
from google.appengine.ext import db
from google.appengine.ext import testbed
from datetime import datetime, timedelta
import tools
import json
from google.appengine.ext import deferred
from base_test_case import BaseTestCase
from flow import app as tst_app


class UtilTestCase(BaseTestCase):

    def setUp(self):
        self.set_application(tst_app)
        self.setup_testbed()
        self.init_datastore_stub()
        self.init_memcache_stub()
        self.init_taskqueue_stub()
        self.register_search_api_stub()

    def testValidJson(self):
        volley=[
            {'json':"{}",'to_return':{}},
            {'json':'{"v":"1"}','to_return':{"v":"1"}},
            {'json':'{"v":"1"\r\n}','to_return':{"v":"1"}},
            {'json':'{"v":1}','to_return':{"v":1}},
            {'json':'"{}"','to_return':{}},
            {'json': "invalid", 'to_return': None},
            {'json': '[{"1":"one"}]', 'to_return': [{1:"one"}] }
        ]

        for v in volley:
            returned = tools.getJson(v['json'])
            self.assertEqual(json.dumps(returned),json.dumps(v['to_return']))

    def testCapitalize(self):
        volley=[
            ("hello there", "Hello there"),
            (None, None),
            ("a", "A"),
            ("john", "John")
        ]

        for v in volley:
            _in, _expect = v
            out = tools.capitalize(_in)
            self.assertEqual(out, _expect)

    def testSafeNum(self):
        volley=[
            ("1,000", 1000),
            ("not a number", None),
            ("2.56", 2.56),
            ("4", 4),
            ("0", 0),
            ("11.0", 11.0)
        ]

        for v in volley:
            _in, _expect = v
            out = tools.safe_number(_in)
            self.assertEqual(out, _expect)

    def testPluralize(self):
        volley=[
            ("item", 1, "item"),
            ("cat", 10, "cats"),
            ("hamburger", 0, "hamburgers")
        ]

        for v in volley:
            _in, _count, _expect = v
            out = tools.pluralize(_in, count=_count)
            self.assertEqual(out, _expect)

    def testTextSanitization(self):
        # Remove non-ascii
        from decimal import Decimal
        volley = [
            ('‘Hello’', 'Hello'),
            (int(10), '10'),
            (False, 'False'),
            (long(20), '20'),
            (u'‘Hello’', 'Hello'),
            (u'‘Hello\nHi’', 'Hello\nHi'),
            (u'Kl\xfcft skr\xe4ms inf\xf6r p\xe5 f\xe9d\xe9ral \xe9lectoral gro\xdfe',
               'Kluft skrams infor pa federal electoral groe'),
            (db.Text(u'‘Hello’'), 'Hello'),
            (db.Text(u'naïve café'), 'naive cafe')
        ]

        for v in volley:
            target = v[1]
            actual = tools.normalize_to_ascii(v[0])
            self.assertEqual(actual, target)

    def testStripSymbols(self):
        # Remove non-ascii
        volley = [
            ('Surely!', 'Surely'),
            ('abc123^&*', 'abc123'),
            ('r*d ra!nbow', 'rd ranbow')
        ]

        for v in volley:
            target = v[1]
            actual = tools.strip_symbols(v[0])
            self.assertEqual(actual, target)

    def testVariableReplacement(self):
        # Remove non-ascii
        volley = [
            ('Hello [NAME]', {'name': 'Louise'}, "Hello Louise"),
            ('[STARS] stars and [MOONS] moons', {'STARS': 1000, 'MOONS': 2}, "1000 stars and 2 moons")
        ]

        for v in volley:
            text, lookup, expected = v
            actual = tools.variable_replacement(text, lookup)
            self.assertEqual(actual, expected)

    def testFromISO(self):
        volley = [
            ('2017-01-01', datetime(2017, 1, 1)),
            ('2001-12-31', datetime(2001, 12, 31)),
            ('1985-04-04', datetime(1985, 4, 4))
        ]

        for v in volley:
            target = v[1]
            actual = tools.fromISODate(v[0])
            self.assertEqual(actual, target)
