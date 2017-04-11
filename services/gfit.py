#!/usr/bin/python
# -*- coding: utf-8 -*-

# API calls to interact with Google Fit


from datetime import datetime, time
from services.gservice import GoogleServiceFetcher
import logging
import tools

# https://developers.google.com/fit/rest/v1/reference/users/sessions/list


class FitClient(GoogleServiceFetcher):

    ACTIVITY_TYPE = {
      "9": "Aerobics",
      "10": "Badminton",
      "11": "Baseball",
      "12": "Basketball",
      "13": "Biathlon",
      "1": "Biking",
      "14": "Handbiking",
      "15": "Mountain biking",
      "16": "Road biking",
      "17": "Spinning",
      "18": "Stationary biking",
      "19": "Utility biking",
      "20": "Boxing",
      "21": "Calisthenics",
      "22": "Circuit training",
      "23": "Cricket",
      "106": "Curling",
      "24": "Dancing",
      "102": "Diving",
      "25": "Elliptical",
      "103": "Ergometer",
      "26": "Fencing",
      "27": "Football (American)",
      "28": "Football (Australian)",
      "29": "Football (Soccer)",
      "30": "Frisbee",
      "31": "Gardening",
      "32": "Golf",
      "33": "Gymnastics",
      "34": "Handball",
      "35": "Hiking",
      "36": "Hockey",
      "37": "Horseback riding",
      "38": "Housework",
      "104": "Ice skating",
      "0": "In vehicle",
      "39": "Jumping rope",
      "40": "Kayaking",
      "41": "Kettlebell training",
      "42": "Kickboxing",
      "43": "Kitesurfing",
      "44": "Martial arts",
      "45": "Meditation",
      "46": "Mixed martial arts",
      "2": "On foot",
      "108": "Other (unclassified fitness activity)",
      "47": "P90X exercises",
      "48": "Paragliding",
      "49": "Pilates",
      "50": "Polo",
      "51": "Racquetball",
      "52": "Rock climbing",
      "53": "Rowing",
      "54": "Rowing machine",
      "55": "Rugby",
      "8": "Running",
      "56": "Jogging",
      "57": "Running on sand",
      "58": "Running (treadmill)",
      "59": "Sailing",
      "60": "Scuba diving",
      "61": "Skateboarding",
      "62": "Skating",
      "63": "Cross skating",
      "105": "Indoor skating",
      "64": "Inline skating (rollerblading)",
      "65": "Skiing",
      "66": "Back-country skiing",
      "67": "Cross-country skiing",
      "68": "Downhill skiing",
      "69": "Kite skiing",
      "70": "Roller skiing",
      "71": "Sledding",
      "72": "Sleeping",
      "109": "Light sleep",
      "110": "Deep sleep",
      "111": "REM sleep",
      "112": "Awake (during sleep cycle)",
      "73": "Snowboarding ",
      "74": "Snowmobile",
      "75": "Snowshoeing",
      "76": "Squash",
      "77": "Stair climbing",
      "78": "Stair-climbing machine",
      "79": "Stand-up paddleboarding",
      "3": "Still (not moving)",
      "80": "Strength training",
      "81": "Surfing",
      "82": "Swimming",
      "84": "Swimming (open water)",
      "83": "Swimming (swimming pool)",
      "85": "Table tennis (ping pong)",
      "86": "Team sports",
      "87": "Tennis",
      "5": "Tilting (sudden device gravity change)",
      "88": "Treadmill (walking or running)",
      "4": "Unknown (unable to detect activity)",
      "89": "Volleyball",
      "90": "Volleyball (beach)",
      "91": "Volleyball (indoor)",
      "92": "Wakeboarding",
      "7": "Walking ",
      "93": "Walking (fitness)",
      "94": "Nording walking",
      "95": "Walking (treadmill)",
      "96": "Waterpolo",
      "97": "Weightlifting",
      "98": "Wheelchair",
      "99": "Windsurfing",
      "100": "Yoga",
      "101": "Zumba"
    }

    def __init__(self, user):
        super(FitClient, self).__init__(user,
                                        api='fitness',
                                        version='v1',
                                        scopes=["https://www.googleapis.com/auth/fitness.activity.read"])

    def get_sessions(self, since=None, until=None):
        success = self.build_service()
        if success:
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
        '''
        Return mapping of activity (str) to seconds of duration on date
        '''
        start = datetime.combine(date, time(0, 0))
        end = datetime.combine(date, time(23, 59))  # Midnight UTC yesterday
        gfit_activities = self.user.get_integration_prop("gfit_activities", "").split(',')
        sessions = self.get_sessions(since=start, until=end)
        var_durations = {}  # activity -> duration in seconds
        if sessions:
            for s in sessions:
                logging.debug(s)
                start = int(s.get('startTimeMillis'))
                end = int(s.get('endTimeMillis', 0))
                activityType = s.get('activityType')
                ms_duration = end - start
                name = s.get('name', '')
                description = s.get('description', '')
                match_pieces = [name, description]
                if activityType:
                    parsed_type = FitClient.ACTIVITY_TYPE.get(str(activityType))
                    if parsed_type:
                        match_pieces.append(parsed_type)
                match_str = ' '.join(match_pieces).lower()
                logging.debug("compare %s to %s" % (gfit_activities, match_str))
                activity_match = None
                for activity in gfit_activities:
                    activity = activity.lower().strip()
                    match = activity in match_str
                    if match:
                        activity_match = activity
                        break
                if activity_match:
                    if activity_match not in var_durations:
                        var_durations[activity_match] = 0
                    var_durations[activity_match] += int(ms_duration / 1000)
        return var_durations
