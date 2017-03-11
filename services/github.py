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

    def get_repo_names(self, updated_since=None):
        mckey = REPO_MEMKEY % self.github_username
        repo_names = memcache.get(mckey)
        if repo_names is None:
            url = '/user/repos?%s' % (urllib.urlencode([
              ('visibility', 'all'),
              # ('affiliation', 'owner,collaborator')
            ]))
            response, repos = self.api_call(url)
            repo_names = []
            for r in repos:
                pushed = self._parse_raw_date(r.get('pushed_at'))
                include = updated_since is None or pushed > updated_since
                if include:
                    repo_names.append(r.get('full_name'))
            if repo_names:
                logging.debug(repo_names)
                memcache.set(mckey, repo_names, time=60*60)  # 1 hr
        return repo_names

    def get_contributions_on_day(self, date):
        '''
        Currently scraping Github public overview page (no API yet)
        '''
        iso_date = tools.iso_date(date)
        response = urlfetch.fetch("https://github.com/%s?tab=overview" % self.github_username)
        if response.status_code == 200:
            bs = BeautifulSoup(response.content, "html.parser")
            commits_on_day = bs.find('rect', {'data-date': iso_date}).get('data-count', 0)
            return commits_on_day
        else:
            logging.error("Error getting contributions")
