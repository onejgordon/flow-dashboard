#!/usr/bin/python
# -*- coding: utf8 -*-

from google.appengine.ext import db
from datetime import datetime, timedelta
import tools
import json
from models import User
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
        volley = [
            {'json': "{}", 'to_return': {}},
            {'json': '{"v":"1"}', 'to_return': {"v": "1"}},
            {'json': '{"v":"1"\r\n}', 'to_return': {"v": "1"}},
            {'json': '{"v":1}', 'to_return': {"v": 1}},
            {'json': '"{}"', 'to_return': {}},
            {'json': "invalid", 'to_return': None},
            {'json': '[{"1":"one"}]', 'to_return': [{1: "one"}]}
        ]

        for v in volley:
            returned = tools.getJson(v['json'])
            self.assertEqual(json.dumps(returned), json.dumps(v['to_return']))

    def testCapitalize(self):
        volley = [
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
        volley = [
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

    def testSafeIsDigit(self):
        volley = [
            ("1", True),
            ("4", True),
            ("0", True),
            (5, True),
            (529291910101000, True),
            ('a', False),
            (None, False),
            ('', False)
        ]

        for v in volley:
            _in, _expect = v
            out = tools.safeIsDigit(_in)
            self.assertEqual(out, _expect)

    def testPluralize(self):
        volley = [
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
            (None, None),
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
            ('[STARS] stars and [MOONS] moons', {
             'STARS': 1000, 'MOONS': 2}, "1000 stars and 2 moons")
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

    def testMinutesIn(self):
        volley = [
            ("00:01", 1),
            ("8:35", 515),
        ]

        for v in volley:
            time_str, expected_mins = v
            time = tools.parseTimeString(time_str)
            self.assertEqual(expected_mins, tools.minutes_in(time))

    def testCloneEntity(self):
        user = User.Create(email="test@example.com", name="John Doe")
        user.put()

        user_cloned = tools.clone_entity(user)
        self.assertEqual(user.name, user_cloned.name)
        self.assertEqual(user.email, user_cloned.email)

    def testChunks(self):
        arr = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        chunked = tools.chunks(arr, 3)
        i = 0
        total = 0
        for chunk in chunked:
            total += sum(chunk)
            i += 1
        self.assertEqual(total, 45)
        self.assertEqual(i, 3)

    def testLookupDicts(self):
        user1 = User.Create(email="test1@example.com", name="Person 1")
        user1.put()
        user2 = User.Create(email="test2@example.com", name="Person 2")
        user2.put()
        lookup = tools.lookupDict([user1, user2], keyprop="key_string")
        u1_key = user1.key.urlsafe()
        u2_key = user2.key.urlsafe()
        self.assertTrue(u1_key in lookup)
        self.assertTrue(u2_key in lookup)
        self.assertEqual(lookup.get(u1_key).name, "Person 1")

    def testEnglishList(self):
        volley = [
            (["one", "two", "three"], "'one', 'two' and 'three'"),
            (["cat", "dog"], "'cat' and 'dog'"),
            ([], "--")
        ]
        for v in volley:
            arr, expected = v
            res = tools.english_list(arr, quote="'")
            self.assertEqual(res, expected)

    def testSafeAddTask(self):
        # Using warmup handler as dummy task
        tools.safe_add_task("/_ah/warmup")
        self.assertTasksInQueue(n=1, queue_names=['default'])
        self.execute_tasks_until_empty()

        tools.safe_add_task(
                            [
                                {'url': "/_ah/warmup", 'params': {'foo': 'bar'}},
                                {'url': "/_ah/warmup", 'params': {'foo': 'baz'}}
                            ],
                            queue_name='report-queue')

        self.assertTasksInQueue(n=2, queue_names=['report-queue'])
        self.execute_tasks_until_empty()
        self.assertTasksInQueue(n=0)

