#!/usr/bin/python
# -*- coding: utf-8 -*-

from google.appengine.ext import vendor
import os
import logging

USE_ABSOLUTE = True

# Add any libraries installed in the "lib" folder.
if USE_ABSOLUTE:
    lib_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'lib')
else:
    lib_path = 'lib'
vendor.add(lib_path)

logging.debug("Ran appengine_config, lib_path: %s" % lib_path)
