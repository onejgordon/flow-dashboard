#!/usr/bin/python
# -*- coding: utf8 -*-

from datetime import datetime
from base_test_case import BaseTestCase
from models import Snapshot
from flow import app as tst_app


class SnapshotTestCase(BaseTestCase):

    def setUp(self):
        self.set_application(tst_app)
        self.setup_testbed()
        self.init_standard_stubs()
        self.init_app_basics()

        self.u = self.users[0]

    def test_submit(self):
        volley = [
            ("Working - Coding", "Office", {'happiness': 10, 'stress': 2}, {'activity': 'Working', 'activity_sub': "Coding", 'place': "Office"}),
            ("Working: Meeting", "Office", {'happiness': 2, 'stress': 4}, {'activity': 'Working', 'activity_sub': "Meeting", 'place': "Office"}),
            ("Running", "Track", {'happiness': 10, 'stress': 1}, {'activity': 'Running', 'activity_sub': None, 'place': "Track"})
        ]
        for v in volley:
            activity, place, metrics, expected_vals = v
            kwargs = {
                'activity': activity,
                'place': place,
                'metrics': metrics
            }
            sn = Snapshot.Create(self.u, **kwargs)
            sn.put()
            for key, val in expected_vals.items():
                self.assertEqual(getattr(sn, key), val)
            for metric, val in metrics.items():
                self.assertEqual(sn.get_data_value(metric), val)

