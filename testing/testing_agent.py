#!/usr/bin/python
# -*- coding: utf8 -*-

from datetime import datetime, timedelta
from base_test_case import BaseTestCase
from models import JournalTag, Goal, MiniJournal
from constants import JOURNAL
from flow import app as tst_app
from services.agent import ConversationAgent
from models import Habit, Task
import tools

class AgentTestCase(BaseTestCase):

    def setUp(self):
        self.set_application(tst_app)
        self.setup_testbed()
        self.init_datastore_stub()
        self.init_memcache_stub()
        self.init_taskqueue_stub()
        self.init_mail_stub()
        self.register_search_api_stub()
        self.init_app_basics()

        self.u = u = self.users[0]
        self.u.Update(name="George")
        self.u.put()
        h = Habit.Create(u)
        h.Update(name="Run")
        h.put()
        t = Task.Create(u, "Dont forget the milk")
        t.put()
        self.milk = t
        g = Goal.CreateMonthly(u, date=datetime.today().date())
        g.Update(text=["Get it done", "Also get exercise"])
        g.put()

        self.ca = ConversationAgent(user=self.u)

    def test_agent_status_query(self):
        speech, data, end_convo = self.ca.respond_to_action('input.status_request')
        self.assertEqual(speech, "Alright George. You haven't completed any tasks yet. You still need to do 'Dont forget the milk'. No habits done yet.")

    def test_agent_goals(self):
        speech, data, end_convo = self.ca.respond_to_action('input.goals_request')
        this_month = datetime.strftime(datetime.today(), "%B %Y")
        self.assertEqual(speech, "Goals for %s. 1: Get it done. 2: Also get exercise. " % this_month)

    def test_agent_habit_add(self):
        speech, data, end_convo = self.ca.respond_to_action('input.habit_add', parameters={'habit': 'meditate'})
        self.assertTrue("Habit 'Meditate' added" in speech, speech)

    def test_agent_habit_report(self):
        speech, data, end_convo = self.ca.respond_to_action('input.habit_or_task_report', parameters={'habit_or_task': 'run'})
        self.assertTrue("'Run' is marked as complete" in speech, speech)

        speech, data, end_convo = self.ca.respond_to_action('input.habit_status')
        self.assertEqual("Good work on doing 1 habit ('Run')!", speech)

    def test_agent_task_report(self):
        speech, data, end_convo = self.ca.respond_to_action('input.habit_or_task_report', parameters={'habit_or_task': 'the milk'})
        self.assertTrue("Task 'Dont forget the milk' is marked as complete" in speech, speech)

        # Check task is marked complete
        self.milk = self.milk.key.get()  # Reload from ndb
        self.assertTrue(self.milk.is_done())

        # And task report confirms this
        speech, data, end_convo = self.ca.respond_to_action('input.task_view')
        self.assertEqual("You've completed 1 task for today.", speech)

    def test_agent_habit_commitment(self):
        speech, data, end_convo = self.ca.respond_to_action('input.habit_commit', parameters={'habit': 'run'})
        self.assertTrue("You've committed to 'Run' today" in speech, speech)

    def test_agent_add_task(self):
        speech, data, end_convo = self.ca.respond_to_action('input.task_add', parameters={'task_name': 'go to the gym'})
        self.assertTrue("Task added" in speech, speech)

        recent_tasks = Task.Recent(self.u)
        self.assertEqual(len(recent_tasks), 2)  # First added in setup
        self.assertEqual(recent_tasks[0].title, "Go to the gym")

    def test_agent_no_user(self):
        self.ca.user = None
        speech, data, end_convo = self.ca.respond_to_action('input.status_request')
        self.assertEqual("To get started with Flow, please link your account with Flow", speech)

    def test_parsing(self):
        volley = [
            # Hello
            ('hi', 'input.hello', None),
            ("What's up", 'input.hello_question', None),
            ("how's it going?", 'input.hello_question', None),

            # Goal requests
            ('what are my goals?', 'input.goals_request', None),
            ('remind me my goals', 'input.goals_request', None),
            ('monthly goals', 'input.goals_request', None),
            ('my goals this month', 'input.goals_request', None),

            # Adding habits
            ('new habit: run', 'input.habit_add', {'habit': 'run'}),
            ('create habit go fishing', 'input.habit_add', {'habit': 'go fishing'}),

            # Habit reports
            ('mark run as complete', 'input.habit_or_task_report', {'habit_or_task': 'run'}),
            ('mark run complete', 'input.habit_or_task_report', {'habit_or_task': 'run'}),
            ('mark run as done', 'input.habit_or_task_report', {'habit_or_task': 'run'}),
            ('mark meditate as finished', 'input.habit_or_task_report', {'habit_or_task': 'meditate'}),
            ('i finished meditate', 'input.habit_or_task_report', {'habit_or_task': 'meditate'}),
            ('set run as complete', 'input.habit_or_task_report', {'habit_or_task': 'run'}),
            ('habit complete: run', 'input.habit_or_task_report', {'habit_or_task': 'run'}),
            ('habit done run', 'input.habit_or_task_report', {'habit_or_task': 'run'}),

            # Habit commitments
            ('i will run tonight', 'input.habit_commit', {'habit': 'run'}),
            ('commit to make dinner tonight', 'input.habit_commit', {'habit': 'make dinner'}),
            ('planning to run this evening', 'input.habit_commit', {'habit': 'run'}),
            ('im going to run later', 'input.habit_commit', {'habit': 'run'}),

            # Habit status
            ('habit progress', 'input.habit_status', None),

            # Add habit
            ('new habit: meditate', 'input.habit_add', {'habit': 'meditate'}),
            ('add habit meditate', 'input.habit_add', {'habit': 'meditate'}),

            # Add task
            ('add task finish report', 'input.task_add', {'task_name': 'finish report'}),
            ('remind me to clean the closet', 'input.task_add', {'task_name': 'clean the closet'}),

            # View tasks
            ('my tasks', 'input.task_view', None),
            ('tasks today', 'input.task_view', None),

            # Task reports
            ('mark go to the pool as done', 'input.habit_or_task_report', {'habit_or_task': 'go to the pool'}),
            ('i completed feed the cat', 'input.habit_or_task_report', {'habit_or_task': 'feed the cat'}),
            ('task done feed the cat', 'input.habit_or_task_report', {'habit_or_task': 'feed the cat'}),

            # Help
            ('what can i do', 'input.help', None),
            ('???', 'input.help', None),
            ('help', 'input.help', None),
            ('help on tasks', 'input.help_tasks', None),
            ('what are habits', 'input.help_habits', None),
            ('learn about journaling', 'input.help_journals', None),

            # Add task
            ('disconnect', 'input.disconnect', None),
        ]
        for v in volley:
            raw_message, expected_action, expected_params = v
            action, params = self.ca.parse_message(raw_message)
            self.assertEqual(expected_action, action, "Error in %s. %s <> %s" % (raw_message, expected_action, action))
            self.assertEqual(expected_params, params, "Error in %s. %s <> %s" % (raw_message, expected_params, params))

    def test_stateful_journal_submission(self):
        # Journal submissions ask multiple questions and require
        # state to be kept in a conversation_state object (memcached)

        # Setup journal questions for account
        # settings = tools.getJson(self.u.settings)

        NARR = "Productive! #Hacked a few things with @JuliaSpiegel"
        RATING = 7

        conversation = [
            # (User message, Flow reply)
            ("daily report", "A few words on your day?", False),  # narrative
            (NARR, "How was the day?", False),  # day_rating
            ("?", JOURNAL.INVALID_REPLY, False),
            ("%s" % RATING, JOURNAL.TOP_TASK_PROMPT, False),
            ("Finish hacking the machine", JOURNAL.TOP_TASK_PROMPT_ADDTL, False),
            ("done", "Report submitted!", True)
        ]
        for message, expected_reply, expected_end_of_convo in conversation:
            action, params = self.ca.parse_message(message)
            reply, message_data, end_convo = self.ca.respond_to_action(action, parameters=params)
            self.assertEqual(expected_end_of_convo, end_convo)
            self.assertEqual(reply, expected_reply)

        # Confirm journal saved properly
        jrnl = MiniJournal.Get(self.u)
        self.assertIsNotNone(jrnl)
        rating = jrnl.get_data_value('day_rating')
        self.assertEqual(rating, RATING)
        narrative = jrnl.get_data_value('narrative')
        self.assertEqual(narrative, NARR)

        # Confirm we have tags from narrative
        tags = JournalTag.All(self.u)
        self.assertEqual(len(tags), 2)
        for t in tags:
            if t.person():
                self.assertEqual(t.name, "JuliaSpiegel")
            else:
                self.assertEqual(t.name, "Hacked")

        # Confirm we created tasks
        tasks = Task.Open(self.u)
        self.assertEqual(len(tasks), 2)  # One added in journal
        self.assertEqual(tasks[0].title, "Finish hacking the machine")

        # Try to submit again
        action, params = self.ca.parse_message("daily journal")
        reply, message_data, end_convo = self.ca.respond_to_action(action, parameters=params)
        self.assertEqual(reply, JOURNAL.ALREADY_SUBMITTED_REPLY)
