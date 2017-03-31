#!/usr/bin/python
# -*- coding: utf-8 -*-

from apiclient import discovery
import logging
from oauth2client import client
import httplib2
from datetime import datetime, timedelta
import tools
from constants import SECURE_BASE
from settings.secrets import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET


class GoogleServiceFetcher(object):

    def __init__(self, user, api='fitness', version='v3', scopes=None):
        self.user = user
        self.service = None
        self.api = api
        self.version = version
        self.credentials = None
        self.get_credentials_object()
        self.http_auth = None
        self.scopes = scopes if scopes else []

    def build_service(self):
        logging.debug("Building service for %s (%s)" % (self.api, self.version))
        if not self.http_auth:
            self.get_http_auth()
        self.service = discovery.build(self.api, self.version, http=self.http_auth)

    def set_google_credentials(self, credentials_object):
        logging.debug(credentials_object.to_json())
        self.user.set_integration_prop('google_credentials', credentials_object.to_json())
        self.user.put()

    def get_google_credentials(self):
        return self.user.get_integration_prop('google_credentials', {})

    def get_auth_flow(self, scope):
        base = 'http://localhost:8080' if tools.on_dev_server() else SECURE_BASE
        flow = client.OAuth2WebServerFlow(client_id=GOOGLE_CLIENT_ID,
                                          client_secret=GOOGLE_CLIENT_SECRET,
                                          scope=scope,
                                          access_type = 'offline',
                                          approval_prompt='force',
                                          redirect_uri=base + "/api/auth/google/oauth2callback")
        flow.params['include_granted_scopes'] = 'true'
        # flow.params['access_type'] = 'offline'
        return flow

    def get_credentials_object(self):
        if not self.credentials:
            cr_json = self.get_google_credentials()
            if cr_json:
                # Note JSON is stored as escaped string, not dict
                cr = client.Credentials.new_from_json(cr_json)
                expires_in = cr.token_expiry - datetime.utcnow()
                logging.debug("expires_in: %s" % expires_in)
                if expires_in < timedelta(minutes=15):
                    try:
                        cr.refresh(httplib2.Http())
                    except client.HttpAccessTokenRefreshError, e:
                        logging.error("HttpAccessTokenRefreshError: %s" % e)
                        cr = None
                    else:
                        self.set_google_credentials(cr)
                self.credentials = cr
                return cr

    def get_auth_uri(self, state=None):
        flow = self.get_auth_flow(scope=' '.join(self.scopes))
        auth_uri = flow.step1_get_authorize_url(state=state)
        return auth_uri

    def get_http_auth(self):
        self.get_credentials_object()
        self.http_auth = self.credentials.authorize(httplib2.Http())

    def check_available_scopes(self):
        scopes = self.credentials.retrieve_scopes(httplib2.Http())
        missing_scopes = []
        if self.scopes:
            for scope in self.scopes:
                if scope not in scopes:
                    missing_scopes.append(scope)
        if missing_scopes:
            logging.debug("Missing scopes: %s" % missing_scopes)
        return missing_scopes
