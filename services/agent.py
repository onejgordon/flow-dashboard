#!/usr/bin/python
# -*- coding: utf-8 -*-

# API calls to interact with API.AI (Google Assistant / Actions / Home, Facebook Messenger)

from google.appengine.ext import ndb
from models import Habit, HabitDay, Task, Goal
from datetime import datetime
import random
from constants import HABIT_DONE_REPLIES, HABIT_COMMIT_REPLIES, SECURE_BASE
import tools

AGENT_GOOGLE_ASST = 1
AGENT_FBOOK_MESSENGER = 2


class ConversationAgent(object):

    def __init__(self, type=AGENT_GOOGLE_ASST, user=None):
        self.type = type
        self.user = user

    def _goals_request(self):
        goals = Goal.Current(self.user, which="month")
        if goals:
            g = goals[0]
            if g.annual():
                speech = "Goals for %s. " % g.date.year()
            else:
                speech = "Goals for %s. " % datetime.strftime(g.date, "%B %Y")
            if g.text:
                for i, text in enumerate(g.text):
                    speech += "%d: %s. " % (i+1, text)
            else:
                speech = "No goals yet"
            return speech

    def _habit_report(self, habit_param_raw):
        handled = False
        speech = None
        if habit_param_raw:
            habits = Habit.Active(self.user)
            for h in habits:
                if habit_param_raw.lower() in h.name.lower():
                    # TODO: Timezone?
                    done, hd = HabitDay.Toggle(h, datetime.today().date(), force_done=True)
                    encourage = random.choice(HABIT_DONE_REPLIES)
                    speech = "%s '%s' is marked as complete." % (encourage, h.name)
                    handled = True
                    break
                else:
                    print habit_param_raw, "not in", h.name
            if not handled:
                speech = "I'm not sure what you mean by '%s'" % habit_param_raw
        else:
            speech = "I couldn't tell what habit you completed"
        return speech

    def _habit_commit(self, habit_param_raw):
        handled = False
        speech = None
        if habit_param_raw:
            habits = Habit.Active(self.user)
            for h in habits:
                if habit_param_raw.lower() in h.name.lower():
                    # TODO: Timezone?
                    hd = HabitDay.Commit(h, datetime.today().date())
                    encourage = random.choice(HABIT_COMMIT_REPLIES)
                    speech = "You've committed to '%s' today. %s" % (h.name, encourage)
                    handled = True
                    break
                else:
                    print habit_param_raw, "not in", h.name
            if not handled:
                speech = "I'm not sure what you mean by '%s'" % habit_param_raw
        else:
            speech = "I couldn't tell what habit you want to commit to"
        return speech

    def _status_request(self):
        habits = Habit.All(self.user)
        today = datetime.today().date()
        habitday_keys = [ndb.Key('HabitDay', HabitDay.ID(h, today), parent=self.user.key) for h in habits]
        habitdays = ndb.get_multi(habitday_keys)
        n_habits_done = 0
        habits_committed_undone = []
        for hd in habitdays:
            if hd:
                if hd.committed and not hd.done:
                    habit = hd.habit.get()
                    if habit:
                        habits_committed_undone.append(habit.name)
                if hd.done:
                    n_habits_done += 1
        tasks = Task.Recent(self.user)
        n_done = 0
        tasks_undone = []
        for task in tasks:
            if task.is_done():
                n_done += 1
            else:
                tasks_undone.append(task.title)
        address = "Alright %s. " % self.user.first_name() if self.user.name else ""
        speech = "%sYou've completed %d %s for today." % (address, n_done, tools.pluralize('task', n_done))
        if tasks_undone:
            speech += " You still need to do '%s'." % (' and '.join(tasks_undone))
        if n_habits_done:
            speech += " Good work on doing %d %s." % (n_habits_done, tools.pluralize('habit', n_habits_done))
        if habits_committed_undone:
            speech += " Don't forget you've committed to %s." % (' and '.join(habits_committed_undone))
        return speech

    def respond_to_action(self, action, parameters=None):
        speech = None
        data = {}
        if self.user:
            if action == 'input.status_request':
                speech = self._status_request()
            elif action == 'input.goals_request':
                speech = self._goals_request()
            elif action == 'input.habit_report':
                speech = self._habit_report(parameters.get('habit'))
            elif action == 'input.habit_commit':
                speech = self._habit_commit(parameters.get('habit'))
        else:
            speech = "Uh oh, is your account linked?"
            if self.type == AGENT_FBOOK_MESSENGER:
                data = {
                    "facebook": {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "button",
                                "text": speech,
                                "buttons": [
                                    {
                                        "type": "account_link",
                                        "url": SECURE_BASE + "/app/fbook/auth"
                                    }
                                ]
                            }
                        }
                    }
                }
        return (speech, data)

    def parse_message(self, message):
        LOOKUP = {
            'what are my goals': 'input.goals_request',
            'how am i doing': 'input.status_request'
        }
        action = LOOKUP.get(message.lower())
        parameters = None  # TODO
        return (action, parameters)



