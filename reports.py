import logging, urllib, gc
from google.appengine.api import memcache, files
from google.appengine.ext import blobstore, db, deferred
from google.appengine.runtime import DeadlineExceededError

import authorized
import handlers
from constants import *
from models import *
import pickle
import tools

MAX_REQUEST_SECONDS = 40

class TooLongError(Exception):
    def __init__(self):
        pass
