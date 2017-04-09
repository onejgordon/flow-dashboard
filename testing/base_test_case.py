#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Base test case class to bootstrap application testing.


Code downloaded from: http://github.com/rzajac/gaeteststarter
@author: Simon Ndunda: Modified to add support for deferred tasks
@author: Rafal Zajac rzajac<at>gmail<dot>com
@copyright: Copyright 2007-2013 Rafal Zajac rzajac<at>gmail<dot>com. All rights reserved.
@license: Licensed under the MIT license
"""

# Python imports
import os
import logging
import json
import base64
import pickle
import webtest
import datetime
import unittest
import logging
import tools

# Google imports
from google.appengine.ext import ndb, testbed
from google.appengine.api.files import file_service_stub
from google.appengine.datastore import datastore_stub_util
from google.appengine.api.blobstore import blobstore_stub, file_blob_storage


class TestbedWithFiles(testbed.Testbed):

    def init_blobstore_stub(self, blobstore_path='/tmp/testbed.blobstore', app_id='test-app'):
        """Helper method to create testbed with files"""

        blob_storage = file_blob_storage.FileBlobStorage(
            blobstore_path, app_id)
        blob_stub = blobstore_stub.BlobstoreServiceStub(blob_storage)
        file_stub = file_service_stub.FileServiceStub(blob_storage)
        self._register_stub('blobstore', blob_stub)
        self._register_stub('file', file_stub)


class BaseTestCase(unittest.TestCase):

    """Base class for all tests"""

    # The WSGIApplication
    #
    # In your tests assign assign to it whatever your application
    # returns from webapp2.WSGIApplication().
    #
    APPLICATION = None

    # Internal property that wraps your application in webtest.TestApp()
    _app = None

    # This is the format usable with strftime / strptime for parsing the
    # ``eta`` field for a particular task
    TASK_ETA_FORMAT = "%Y/%m/%d %H:%M:%S"

    # Setup helpers

    def setup_testbed(self, app_id='test-app'):
        logging.getLogger().setLevel(logging.DEBUG)
        self.testbed = testbed.Testbed()
        self.testbed.activate()
        self.testbed.setup_env(app_id=app_id)

    def setup_testbed_with_files(self, app_id='test-app'):
        self.testbed = TestbedWithFiles()
        self.testbed.activate()
        self.testbed.setup_env(app_id=app_id)

    def teardown_testbed(self):
        self.testbed.deactivate()

    def register_search_api_stub(self):
        from google.appengine.api.search.simple_search_stub import SearchServiceStub
        self.testbed._register_stub('search', SearchServiceStub())

    def init_taskqueue_stub(self, queue_yaml_path='.'):
        self.testbed.init_taskqueue_stub()
        # Setup task queue stub
        taskqueue_stub = self.get_task_queue_stub()
        # Ensure dev appserver task queue knows where to find queue.yaml
        taskqueue_stub._root_path = os.path.dirname(
            os.path.dirname(queue_yaml_path))

    def get_task_queue_stub(self):
        """Get task queue stub"""
        return self.testbed.get_stub(testbed.TASKQUEUE_SERVICE_NAME)

    def init_urlfetch_stub(self):
        self.testbed.init_urlfetch_stub()

    def init_mail_stub(self):
        self.testbed.init_mail_stub()

    def init_image_stub(self):
        self.testbed.init_images_stub()

    def init_blobstore_stub(self):
        self.testbed.init_blobstore_stub()

    def init_memcache_stub(self):
        self.testbed.init_memcache_stub()

    def init_datastore_stub(self, probability=1):
        """Initialize datastore stub

            See: https://developers.google.com/appengine/docs/python/tools/localunittesting#Writing_HRD_Datastore_Tests
        """
        ds_policy = datastore_stub_util.PseudoRandomHRConsistencyPolicy(
            probability=probability)
        self.testbed.init_datastore_v3_stub(consistency_policy=ds_policy)

    def init_standard_stubs(self):
        self.init_datastore_stub()
        self.init_memcache_stub()
        self.init_taskqueue_stub()
        self.init_mail_stub()
        self.register_search_api_stub()

    def init_app_basics(self, n_users=1):
        from models import User

        self.users = []

        for x in range(n_users):
            email = "email_%s@example.com" % (tools.GenPasswd())
            user = User.Create(email=email)
            user.setPass("pw")
            user.put()
            self.users.append(user)


        # Setup API authentication params for use in API calls
        if n_users:
            encoded = base64.b64encode("%s:%s" % (self.users[0].key.id(), "pw"))
            self.api_headers = {
                'authorization': "Basic %s" % encoded
            }

    # Application helpers

    def set_application(self, application):
        """Set application and TestApp to use in tests"""

        self.APPLICATION = application
        self._app = webtest.TestApp(self.APPLICATION)

    def clear_application(self):
        """Clear application and TestApp

            You should put it in your tearDown()
        """
        self.APPLICATION = None
        self._app = None

    def save_application(self):
        """Save currently used application so you can switch to different one

            This helps when your app is composed from many
            small applications that you define in app.yaml
            file. Example:

            - url: /admin/batch/.*
              script: myapp.routes.app
              login: admin

            - url: /admin/scripts/.*
              script: myapp.scripts.routes.app
              login: admin

            In this case your application has at least two webapp2.WSGIApplication()

            Returns: The current TestApp and APPLICATION tuple
        """
        return self._app, self.APPLICATION

    def restore_application(self, saved_application):
        """Restore APPLICATION saved with save_application method"""

        self._app = saved_application[0]
        self.APPLICATION = saved_application[1]

    @property
    def app(self):
        """Get application wrapped in webtest.TestApp"""

        error = 'APPLICATION not set'
        self.assertTrue(self.APPLICATION is not None, error)

        error = '_app not set'
        self.assertTrue(self._app is not None, error)

        return self._app

    # Helpers for testing web handlers and responses

    def assertRedirects(self, response, to=None):
        """Asserts that a response from the test web server returns a 301 or 302 status.

            This assertion would fail if you expect the page to redirect and instead
            the server tells the browser that there was a 500 error, or some other
            non-redirecting status code.
        """

        error = 'Response did not redirect (status code was %i).' % response.status_int
        self.assertTrue(response.status_int in (301, 302), error)

        if to is not None:
            error = 'Response redirected, but went to %s instead of %s' % (
                response.location, to)
            self.assertEqual(
                response.location, 'http://localhost%s' % to, error)

    def assertOK(self, response):
        """Asserts that a response from the test web server returns a 200 OK status code.

            This assertion would fail if you expect a standard page to be returned
            and instead the server tells the browser to redirect elsewhere.
        """

        error = 'Response did not return a 200 OK (status code was %i)' % response.status_int
        return self.assertEqual(response.status_int, 200, error)

    def assertNotFound(self, response):
        """Asserts that a response from the test web server returns a 404 status code."""

        error = 'Response was found (status code was %i)' % response.status_int
        return self.assertEqual(response.status_int, 404, error)

    def assertForbidden(self, response):
        """Asserts that a response from the test web server returns a 403 status code."""

        error = 'Response was allowed (status code was %i)' % response.status_int
        return self.assertEqual(response.status_int, 403, error)

    def assertUnauthorized(self, response):
        """Asserts that a response from the test web server returns a 401 status code."""

        error = 'Response was allowed (status code was %i)' % response.status_int
        return self.assertEqual(response.status_int, 401, error)

    def get(self, url, *args, **kwargs):
        """Performs GET request to your application"""
        return self.app.get(url, *args, **kwargs)

    def head(self, *args, **kwargs):
        """Performs HEAD request to your application"""
        return self.app.head(*args, **kwargs)

    def post(self, url, data, *args, **kwargs):
        """Performs POST request to your application"""
        data = self.url_encode(data)
        return self.app.post(url, data, *args, **kwargs)

    def post_json(self, url, data, *args, **kwargs):
        """Performs POST request to your application and expects JSON"""
        data = self.url_encode(data)
        res = self.app.post(url, data, *args, **kwargs)
        self.assertOK(res)
        return json.loads(res.normal_body)

    def get_json(self, url, *args, **kwargs):
        """Performs GET request to your application and expects JSON"""
        res = self.app.get(url, *args, **kwargs)
        self.assertOK(res)
        return json.loads(res.normal_body)

    def delete(self, *args, **kwargs):
        """Performs DELETE request to your application"""
        return self.app.delete(*args, **kwargs)

    def put(self, *args, **kwargs):
        """Performs PUT request to your application"""
        return self.app.put(*args, **kwargs)

    def utf8_encode(self, v):
        res = unicode(v).encode('utf-8')
        return res

    def url_encode(self, data):
        """Encode data in URL friendly way"""
        if isinstance(data, dict):
            items = []
            for k, v in data.copy().items():
                if isinstance(v, (list, tuple)):
                    for item in v:
                        items.append('%s=%s' % (k, self.utf8_encode(item)))
                else:
                    items.append('%s=%s' % (k, self.utf8_encode(v)))
            data = '&'.join(items)
        return data

    def get_cookie(self, cookie_name):
        """Get cookie from your application by name"""
        return self.app.cookies.get(cookie_name)

    def set_cookie(self, cookie_name, cookie_value):
        """Set cookie in your application"""
        self.app.cookies[cookie_name] = cookie_value

    # Task queue testing helpers

    def assertTasksInQueue(self, n=None, url=None, name=None, queue_names=None):
        """Assert number of tasks in queue is not 0 or equal to n"""

        tasks = self.get_tasks(url=url, name=name, queue_names=queue_names)

        if n is None:
            self.assertNotEqual(0, len(tasks))
        else:
            self.assertEqual(n, len(tasks))

    def clear_task_queue(self):
        """Clear all task queues"""

        stub = self.get_task_queue_stub()
        for name in self.get_task_queue_names():
            stub.FlushQueue(name)

    def is_deferred_task(self, task):
        return task.get("url") == "/_ah/queue/deferred"

    def get_tasks(self, url=None, name=None, queue_names=None):
        """Get tasks

            Arguments:
                url - get task by URL
                name - get task by name
                queue_names - names of the queues to get tasks from

            If none of the arguments is provided all tasks from all queues
            will be returned.

            Returns: array of tasks
        """

        tasks = []
        stub = self.get_task_queue_stub()

        for queue_name in queue_names or self.get_task_queue_names():
            tasks.extend(stub.GetTasks(queue_name))

        if url is not None:
            tasks = [t for t in tasks if t['url'] == url]

        if name is not None:
            tasks = [t for t in tasks if t['name'] == name]

        for task in tasks:
            params = {}
            decoded_body = base64.b64decode(task['body'])

            if not self.is_deferred_task(task) and decoded_body:
                # urlparse.parse_qs doesn't seem to be in Python 2.5...
                params = dict([item.split('=', 2)
                               for item in decoded_body.split('&')])

            task.update({
                'decoded_body': decoded_body,
                'params': params,
            })

            if task.get('eta'):
                task['eta_datetime'] = datetime.datetime.strptime(
                    task['eta'], self.TASK_ETA_FORMAT)
                task['eta_date'] = task['eta_datetime'].date()
                task['eta_time'] = task['eta_datetime'].time()
            else:
                task.update({
                    'eta_datetime': None,
                    'eta_date':     None,
                    'eta_time':     None,
                })

        return tasks

    def get_task_queues(self, queue_name=None):
        """Get task queue names

            If queue_name is provided only named queue is returned.
            If there are no queues or queue_name is not found None is returned

            Returns: task queue or None
        """

        queues = self.get_task_queue_stub().GetQueues()

        if queue_name is None:
            return queues
        else:
            found = None
            for queue in queues:
                if queue['name'] == queue_name:
                    found = queue
                    break
            return found

    def get_task_queue_names(self):
        """Get all task names from all queues

            Returns: array of task queue names
        """
        return [q['name'] for q in self.get_task_queues()]

    def execute_task(self, task, application=None):
        """Execute task and remove it from the queue"""

        logging.debug("-------------Excecuting task: %s (%s)-----------------" %
                      (task.get("name"), task.get("url")))
        save_app = (None, None)
        if application is not None:
            save_app = self.save_application()
            self.set_application(application)
            restore_app = True
        else:
            restore_app = False
        if self.is_deferred_task(task):
            (func, args, kwargs) = pickle.loads(task['decoded_body'])
            func(*args, **kwargs)
        else:
            response = self.post(task['url'], task['params'])
            self.assertOK(response)

        stub = self.get_task_queue_stub()
        stub.DeleteTask(task['queue_name'], task['name'])

        if restore_app:
            self.restore_application(save_app)

    def execute_tasks(self, application=None):
        """Executes all currently queued tasks, and also remove them from the queue.

            The tasks are executed against the provided web application.

            Returns: Number of tasks that have been executed
        """

        # Get all of the tasks, and then clear them.
        tasks = self.get_tasks()
        self.clear_task_queue()

        # Run each of the tasks, checking that they succeeded.
        for task in tasks:
            self.execute_task(task, application)

        return len(tasks)

    def execute_tasks_until_empty(self, application=None):
        """Execute all tasks in the queue

            If any of the tasks already in the queue create more tasks this
            method will be excecuting them as well till there is
            no more tasks to execute.

            Returns: Number of tasks that have been executed
        """

        total_count = 0

        while True:
            exec_count = self.execute_tasks(application)
            logging.debug("executed %d tasks" % exec_count)
            if exec_count > 0:
                total_count += exec_count
            else:
                break
        logging.debug(
            "----------------Executed %d tasks (recursively)----------------" % total_count)
        return total_count

    # Other helper methods

    def load_json_fixture(self, fixture_name):
        """Load JSON fixture and return Python structure"""

        fixture = open('fixtures/%s.json' % fixture_name, 'r')
        return json.loads(fixture.read())

    def check_if_api_error(self, response):
        """Helper to test APIs

            NOTE: You have to customize this method to match your API errors.

            This is expects that API returns JSON with following structure:

            {
                "status_code": 200,
                "error": "The error message"
            }
        """
        self.assertTrue(response.status_int == 400 or response.status_int ==
                        401, 'API status code should be 400 or 401.')

        response = json.loads(response.body)

        self.assertTrue(response['status_code'] == 400 or response[
                        'status_code'] == 401, 'API status code should be 400 or 401.')
        self.assertTrue(
            'error' in response, 'Response should have error property.')

    def compare_lists(self, list1, list2):
        """Compare lists using sets

            Returns:
                returns 0 if the lists are the same
        """

        return len(set(list1) ^ set(list2))

    def removeNDBCache(self, key):
        """Helper method to remove key from context cache"""
        # key.delete(use_datastore=False)
        ndb.get_context()._clear_memcache((key,)).get_result()

    def clearNDBCache(self):
        ndb.get_context().clear_cache()

    def tearDown(self):
        self.clear_application()
        self.clearNDBCache()
        self.teardown_testbed()

