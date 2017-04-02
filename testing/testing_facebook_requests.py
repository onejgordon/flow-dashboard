#!/usr/bin/python
# -*- coding: utf8 -*-

from datetime import datetime, timedelta
from base_test_case import BaseTestCase
from models import Goal
from flow import app as tst_app
from models import Habit, Task
from services.agent import FacebookAgent
import json


class DummyRequest():

    def __init__(self, body):
        self.body = json.dumps(body)

FB_ID = "1182039228580000"

class FacebookTestCase(BaseTestCase):

    def setUp(self):
        self.set_application(tst_app)
        self.setup_testbed()
        self.init_datastore_stub()
        self.init_memcache_stub()
        self.init_taskqueue_stub()
        self.init_mail_stub()
        self.register_search_api_stub()
        self.init_app_basics()

        self.u = u = self.users[0]
        self.u.Update(name="George", fb_id=FB_ID)
        self.u.put()
        h = Habit.Create(u)
        h.Update(name="Run")
        h.put()
        t = Task.Create(u, "Dont forget the milk")
        t.put()
        g = Goal.CreateMonthly(u, date=datetime.today().date())
        g.Update(text=["Get it done", "Also get exercise"])
        g.put()


    def test_a_request(self):
        fa = FacebookAgent(DummyRequest({
            'entry': [
                {'messaging': [
                    {
                        'timestamp': 1489442604947,
                        'message': {'text': 'how do goals work', 'mid': 'mid.123:e9c21f9b61', 'seq': 5445},
                        'recipient': {'id': '197271657425000'},
                        'sender': {'id': FB_ID}
                    }
                ], 'id': '197271657425620', 'time': 1489442605073}
                ], 'object': 'page'}
            ))
        res_body = fa.send_response()
        self.assertTrue("You can review your monthly and annual goals. Try saying 'view goals'" in res_body.get('message', {}).get('text'))


    def test_account_linking_request(self):
        fa = FacebookAgent(DummyRequest({
            'entry': [
                {'messaging': [
                    {
                        'timestamp': 1489442604947,
                        'account_linking': {
                            'status': 'linked',
                            'authorization_code': self.u.key.id()
                        },
                        'recipient': {'id': '197271657425000'},
                        'sender': {'id': FB_ID}
                    }
                ], 'id': '197271657425620', 'time': 1489442605073}
                ], 'object': 'page'}
            ))
        res_body = fa.send_response()
        self.assertTrue("you've successfully connected with Flow!" in res_body.get('message', {}).get('text'))

