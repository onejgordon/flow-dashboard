#!/usr/bin/python
# -*- coding: utf-8 -*-

# API calls to interact with Github

from google.appengine.api import urlfetch
import base64
import json
import logging
import urllib
from datetime import datetime, timedelta, time
from google.appengine.api import memcache
import tools
from bs4 import BeautifulSoup

BASE = 'https://api.github.com'
REPO_MEMKEY = "GITHUB:%s"
GH_DATE = "%Y-%m-%dT%H:%M:%SZ"


class GithubClient(object):

    def __init__(self, user):
        self.user = user
        self.pat = self.user.get_integration_prop('github_pat')
        self.github_username = self.user.get_integration_prop('github_username')

    def _can_run(self):
        return self.pat and self.github_username

    def _parse_raw_date(self, date):
        return datetime.strptime(date, GH_DATE)

    def api_call(self, url):
        '''
        Return tuple (response_object, json parsed response)
        '''
        if not url.startswith('http'):
            url = BASE + url
        auth_header = {"Authorization": "Basic %s" % base64.b64encode("%s:%s" % (self.github_username, self.pat))}
        logging.debug("GET %s" % url)
        response = urlfetch.fetch(url, method="GET", deadline=60, headers=auth_header)
        if response.status_code == 200:
            return (response, json.loads(response.content))
        else:
            logging.debug(response.content)
        return (response, None)

    def get_contributions_on_date_range(self, date_range):
        '''
        Currently scraping Github public overview page (no API yet)
        '''
        response = urlfetch.fetch("https://github.com/%s?tab=overview" % self.github_username, deadline=30)
        if response.status_code == 200:
            bs = BeautifulSoup(response.content, "html.parser")
            commits_dict = {}
            for date in date_range:
                iso_date = tools.iso_date(date)
                commits_on_day = bs.find('rect', {'data-date': iso_date}).get('data-count', 0)
                commits_dict[date] = commits_on_day
            return commits_dict
        else:
            logging.error("Error getting contributions")
