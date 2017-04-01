#!/usr/bin/python
# -*- coding: utf-8 -*-

# API calls to interact with Google Big Query

# TODO:
# - User authentication for own bigquery dataset access (otherwise datasets created in flow account?)
# - Build in push date overlap to handle late-reported data

from __future__ import absolute_import
from datetime import datetime, timedelta, time
from services.gservice import GoogleServiceFetcher
from constants import JOURNAL
from models import Habit, HabitDay, Task, Readable, MiniJournal
from apiclient.errors import HttpError
import logging
import tools


class BigQueryClient(GoogleServiceFetcher):

    def __init__(self, user):
        super(BigQueryClient, self).__init__(user,
                                             api='bigquery',
                                             version='v2',
                                             scopes=["https://www.googleapis.com/auth/bigquery"])
        self.user = user
        # self.credentials = GoogleCredentials.get_application_default()
        self.dataset_name = self.user.get_integration_prop('bigquery_dataset_name')
        self.table_name = self.user.get_integration_prop('bigquery_table_name')
        # self.dataset = self.client.dataset(self.dataset_name)
        self.table = None
        self.habits = None
        self.journal_questions = None
        # here = os.path.dirname(os.path.abspath(__file__))
        # logging.debug('google: {} google.cloud.bigquery: {}'.format(
        #     os.path.relpath(google.__file__, here),
        #     os.path.relpath(bigquery.__file__, here)
        # ))

    def _maybe_get_habits(self):
        if self.habits is None:
            self.habits = Habit.Active(self.user)

    def _maybe_get_journal_questions(self):
        if self.journal_questions is None:
            qs = tools.getJson(self.user.settings, {}).get('journals', {}).get('questions', [])
            self.journal_questions = [q for q in qs if q.get('response_type') in JOURNAL.NUMERIC_RESPONSES]

    def _field(self, name, type, mode="REQUIRED", description=None):
        f = {
            "type": type,
            "name": name,
            "mode": mode
        }
        if description:
            f["description"] = description
        return f

    def _habit_col(self, h):
        return "habit_%s" % h.slug_name()

    def _journal_col(self, q):
        return "journal_%s" % q.get('name', '')

    def _bq_schema(self):
        # Genreate bigquery schema from user
        common_fields = [
            self._field("date", "DATE"),
            self._field("tasks_done", "INT64"),
            self._field("tasks_undone", "INT64"),
            self._field("habits_done", "INT64"),
            self._field("habits_cmt", "INT64"),
            self._field("habits_cmt_undone", "INT64", description="Habits committed but not completed"),
            self._field("items_read", "INT64")
        ]
        self._maybe_get_habits()
        self._maybe_get_journal_questions()
        user_fields = []
        for h in self.habits:
            user_fields.append(self._field(self._habit_col(h),
                                           "BOOL",
                                           description="Habit done - %s" % h.name))
        for q in self.journal_questions:
            name = self._journal_col(q)
            label = q.get('label')
            user_fields.append(
                self._field(name, "FLOAT64",
                            mode="NULLABLE",
                            description="Journal response: %s" % label))
        schema = common_fields + user_fields
        # TODO: How do schema changes work?
        return schema

    # def get_table(self):
    #     self.table = self.dataset.table(self.table_name, self._bq_schema())
    #     if not self.table.exists(client=self.client):
    #         logging.debug("Creating table...")
    #         self.table.create(client=self.client)

    def fetch_daily_panel_data(self, since=None, until=None):
        self._maybe_get_habits()
        self._maybe_get_journal_questions()
        if not since:
            since = datetime.combine((datetime.now() - timedelta(days=8)).date(), time(0, 0))
        if not until:
            until = datetime.combine((datetime.now() - timedelta(days=1)).date(), time(0, 0))
        rows = []
        habitdays_by_day = tools.partition(
            HabitDay.Range(self.user, self.habits, since, until_date=until),
            lambda hd: tools.iso_date(hd.date)
        )
        tasks_by_day = tools.partition(
            Task.DueInRange(self.user, since, until, limit=500),
            lambda t: tools.iso_date(t.dt_due)
        )
        readables_by_day = tools.partition(
            Readable.Fetch(self.user, read=True,
                           since=tools.iso_date(since),
                           until=tools.iso_date(until)),
            lambda r: tools.iso_date(r.dt_read)
        )
        journals, iso_dates = MiniJournal.Fetch(self.user, start=since, end=until)
        journals_by_day = tools.partition(journals, lambda jrnl: tools.iso_date(jrnl.date))
        cursor = since
        while cursor <= until:
            iso_date = tools.iso_date(cursor)
            tasks = tasks_by_day.get(iso_date, [])
            habits = habitdays_by_day.get(iso_date, [])
            readables = readables_by_day.get(iso_date, [])
            journals = journals_by_day.get(iso_date, [])
            journal = journals[0] if journals else None
            tasks_done = tasks_undone = habits_done = habits_cmt = habits_cmt_undone = items_read = 0
            for t in tasks:
                if t.is_done():
                    tasks_done += 1
                else:
                    tasks_undone += 1
            for hd in habits:
                if hd.done:
                    habits_done += 1
                if hd.committed:
                    habits_cmt += 1
                    if not hd.done:
                        habits_cmt_undone += 1
            items_read = len(readables)
            row = {
                "id": iso_date,
                "date": iso_date,
                "tasks_done": tasks_done,
                "tasks_undone": tasks_undone,
                "habits_done": habits_done,
                "habits_cmt": habits_cmt,
                "habits_cmt_undone": habits_cmt_undone,
                "items_read": items_read
            }
            for h in self.habits:
                this_habit_done = False
                row[self._habit_col(h)] = 'true' if this_habit_done else 'false'
            for q in self.journal_questions:
                name = q.get('name')
                value = None
                if journal:
                    value = journal.get_data_value(name)
                    if value:
                        value = float(value)
                    else:
                        value = 0
                row[self._journal_col(q)] = value
            rows.append(row)
            cursor += timedelta(days=1)
        return rows

    def get_table(self):
        from settings.secrets import GOOGLE_PROJECT_ID
        try:
            response = self.service.tables().get(projectId=GOOGLE_PROJECT_ID,
                                                   datasetId=self.dataset_name,
                                                   tableId=self.table_name,
                                                ).execute()
            return True
        except HttpError, e:
            return False

    def create_table(self):
        # TODO
        from settings.secrets import GOOGLE_PROJECT_ID
        body = {
            "tableReference": {
                "projectId": GOOGLE_PROJECT_ID,
                "tableId": self.table_name,
                "datasetId": self.dataset_name
            },
            "schema": {
                "fields": self._bq_schema()
            }
        }
        response = self.service.tables().insert(projectId=GOOGLE_PROJECT_ID,
                                                  datasetId=self.dataset_name,
                                                  body=body).execute()
        logging.debug(response)

    def push_data(self, rows):
        from settings.secrets import GOOGLE_PROJECT_ID
        logging.debug("Inserting %d rows into table '%s'" % (len(rows), self.table_name))
        # errors = self.table.insert_data(rows, row_ids=row_ids,
        #                        ignore_unknown_values=True,
        #                        client=self.client)
        body = {
            "kind": "bigquery#tableDataInsertAllRequest",
            "rows": [{"insertId": r.pop("id"), "json": r} for r in rows]
        }
        response = self.service.tabledata().insertAll(projectId=GOOGLE_PROJECT_ID,
                                                      datasetId=self.dataset_name,
                                                      tableId=self.table_name,
                                                      body=body).execute()
        logging.debug(response)
        if response:
            if 'insertErrors' in response:
                logging.debug(response.get('insertErrors'))


    def run(self):
        self.build_service()
        have_table = self.get_table()
        if not have_table:
            self.create_table()
        rows = self.fetch_daily_panel_data()
        self.push_data(rows)


