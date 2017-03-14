#!/usr/bin/python
# -*- coding: utf-8 -*-

# API calls to interact with API.AI (Google Assistant / Actions / Home, Facebook Messenger)

from google.appengine.ext import ndb
from models import Habit, HabitDay, Task, Goal
from datetime import datetime
import random
from constants import HABIT_DONE_REPLIES, HABIT_COMMIT_REPLIES
import tools


def _goals_request(user):
    goals = Goal.Current(user, which="month")
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


def _habit_report(user, habit_param_raw):
    handled = False
    speech = None
    if habit_param_raw:
        habits = Habit.Active(user)
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


def _habit_commit(user, habit_param_raw):
    handled = False
    speech = None
    if habit_param_raw:
        habits = Habit.Active(user)
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


def _status_request(user):
    habits = Habit.All(user)
    today = datetime.today().date()
    habitday_keys = [ndb.Key('HabitDay', HabitDay.ID(h, today), parent=user.key) for h in habits]
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
    tasks = Task.Recent(user)
    n_done = 0
    tasks_undone = []
    for task in tasks:
        if task.is_done():
            n_done += 1
        else:
            tasks_undone.append(task.title)
    address = "Alright %s. " % user.first_name() if user.name else ""
    speech = "%sYou've completed %d %s for today." % (address, n_done, tools.pluralize('task', n_done))
    if tasks_undone:
        speech += " You still need to do '%s'." % (' and '.join(tasks_undone))
    if n_habits_done:
        speech += " Good work on doing %d %s." % (n_habits_done, tools.pluralize('habit', n_habits_done))
    if habits_committed_undone:
        speech += " Don't forget you've committed to %s." % (' and '.join(habits_committed_undone))
    return speech


def respond_to_action(user, action, parameters=None, agent_type=None):
    speech = None
    if user:
        if action == 'input.status_request':
            speech = _status_request(user)
        elif action == 'input.goals_request':
            speech = _goals_request(user)
        elif action == 'input.habit_report':
            speech = _habit_report(user, parameters.get('habit'))
        elif action == 'input.habit_commit':
            speech = _habit_commit(user, parameters.get('habit'))
    else:
        speech = "Uh oh, is your account linked?"
    return speech

