#!/usr/bin/python
# -*- coding: utf-8 -*-

# API calls to interact with Google Fit


from datetime import datetime
from services.gservice import GoogleServiceFetcher
import logging

# https://developers.google.com/fit/rest/v1/reference/users/sessions/list


class FitClient(GoogleServiceFetcher):

    def __init__(self, user):
        super(FitClient, self).__init__(user,
                                        api='fitness',
                                        version='v1',
                                        scopes=["https://www.googleapis.com/auth/fitness.activity.read"])

    def get_sessions(self, filter_keyword=None):
        # TODO: Filter query to last sync?
        self.build_service()
        results = self.service.users().sessions().list(userId='me').execute()
        sessions = results.get('session')
        filtered_sessions = []
        for s in sessions:
            start = int(s.get('startTimeMillis'))
            ms_duration = int(s.get('endTimeMillis', 0)) - start
            when = datetime.fromtimestamp(start / 1000)
            name = s.get('name')
            include = True
            if filter_keyword:
                include = filter_keyword.lower() in name.lower()
            if include:
                filtered_sessions.append({
                    'name': name,
                    'when': when,
                    'duration_secs': ms_duration / 1000
                })
        return filtered_sessions