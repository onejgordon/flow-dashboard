#!/usr/bin/python
# -*- coding: utf8 -*-

from datetime import datetime
from base_test_case import BaseTestCase
from models import Task, User, Report
from constants import REPORT
from flow import app as tst_app
import tools
DATE_FMT = "%Y-%m-%d %H:%M:%S %Z"


class ReportsTestCases(BaseTestCase):

    def setUp(self):
        self.set_application(tst_app)
        self.setup_testbed()
        self.init_standard_stubs()
        self.init_app_basics()
        self.u = self.users[0]

    def _test_report(self, params, expected_output):
        response = self.post_json("/api/report/generate", params, headers=self.api_headers)
        rkey = response.get('report', {}).get('key')
        rid = response.get('report', {}).get('id')
        self.execute_tasks_until_empty()
        response = self.get("/api/report/serve?rkey=%s" % rkey, headers=self.api_headers)
        compare_output = response.body  # Avoid whitespace normalization in normal_body
        compare_output = compare_output.replace('\r\n', '\n').replace('\r', '\n').split('\n')
        self.assertEqual([x for x in compare_output if x], expected_output)
        self.assertEqual(response.content_type, 'text/csv')
        report = self.u.get(Report, rid)
        self.assertTrue(report.is_done())
        self.assertTrue(report.get_duration() > 0)

    def test_task_report(self):
        due_date = datetime(2017, 10, 2, 12, 0)
        task = Task.Create(self.u, "New task", due=due_date)
        task.put()

        self._test_report(
            {'type': REPORT.TASK_REPORT},
            [
                'Date Created,Date Due,Date Done,Title,Done,Archived',
                ",".join([
                    tools.sdatetime(task.dt_created, fmt=DATE_FMT),
                    "2017-10-02 12:00:00 UTC",
                    "N/A",
                    "New task",
                    "0",
                    "0"])
                ]
            )
