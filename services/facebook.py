#!/usr/bin/python
# -*- coding: utf-8 -*-

import urllib
from secrets import FB_ACCESS_TOKEN
from google.appengine.api import urlfetch
import json


URL = "https://graph.facebook.com/v2.6/me/messages?access_token=%s" % FB_ACCESS_TOKEN


def send_message(user, message, quick_replies=None):
    body = {
        "recipient": {
            "id": user.fb_id
        },
        "message": {
            "text": message
        }
    }
    response = urlfetch.post(URL, json.dumps(body))
    if response.status_code == 200:
        pass