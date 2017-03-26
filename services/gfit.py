#!/usr/bin/python
# -*- coding: utf-8 -*-

# API calls to interact with Google Fit


from datetime import datetime, time
from services.gservice import GoogleServiceFetcher
import logging
import tools

# https://developers.google.com/fit/rest/v1/reference/users/sessions/list


class FitClient(GoogleServiceFetcher):

    def __init__(self, user):
        super(FitClient, self).__init__(user,
                                        api='fitness',
                                        version='v1',
                                        scopes=["https://www.googleapis.com/auth/fitness.activity.read"])

    def get_sessions(self, since=None, until=None):
        self.build_service()
        kwargs = {
            'userId': 'me'
        }
        if since:
            kwargs['startTime'] = since.isoformat() + '.00Z'
        if until:
            kwargs['endTime'] = until.isoformat() + '.00Z'
        results = self.service.users().sessions().list(**kwargs).execute()
        sessions = results.get('session')
        return sessions

    def aggregate_activity_durations(self, date):
        start = datetime.combine(date, time(0, 0))
        end = datetime.combine(date, time(23, 59))  # Midnight UTC yesterday
        gfit_activities = self.user.get_integration_prop("gfit_activities", "").split(',')
        sessions = self.get_sessions(since=start, until=end)
        var_durations = {}  # activity -> duration in seconds
        for s in sessions:
            start = int(s.get('startTimeMillis'))
            end = int(s.get('endTimeMillis', 0))
            ms_duration = end - start
            name = s.get('name', '')
            description = s.get('description', '')
            activity_match = None
            for activity in gfit_activities:
                activity = activity.lower().strip()
                match = activity in (name + ' ' + description).lower()
                if match:
                    activity_match = activity
                    break
            if activity_match:
                if activity_match not in var_durations:
                    var_durations[activity_match] = 0
                var_durations[activity_match] += int(ms_duration / 1000)
        return var_durations
