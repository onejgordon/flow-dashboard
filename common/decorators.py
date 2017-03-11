#!/usr/bin/python
# -*- coding: utf-8 -*-
import functools
import logging
from time import time
from google.appengine.api import memcache
import tools

NOTIFY_FAIL_RETRY_COUNT = 5
PERMANENT_FAIL_RETRY_COUNT = 15


def auto_cache(expiration=60*60, key=None):
    """
    A decorator to memorize the results of a function call in memcache. Use this
    in preference to doing your own memcaching, as this function avoids version
    collisions etc...
    Note that if you are not providing a key (or a function to create one) then your
    arguments need to provide consistent str representations of themselves. Without an
    implementation you could get the memory address as part of the result - "<... object at 0x1aeff0>"
    which is going to vary per request and thus defeat the caching.

    Usage:
    @auto_cache
    get_by_type(type):
        return MyModel.all().filter("type =", type)

    :param expiration: Number of seconds before the value is forced to re-cache, 0
    for indefinite caching

    :param key: Option manual key, use in combination with expiration=0 to have
    memcaching with manual updating (eg by cron job). Key can be a func(*args, **kwargs)
    :rtype: Memoized return value of function
    """

    def wrapper(fn):
        @functools.wraps(fn)
        def cache_decorator(*args, **kwargs):
            mc_key = None
            force_refresh = kwargs.pop('refresh', False)
            if key:
                if callable(key):
                    mc_key = key(*args, **kwargs)
                else:
                    mc_key = key
            else:
                mc_key = '%s:%s' % (
                    "auto_cache",
                    tools.make_function_signature(
                        fn.func_name, *args, **kwargs))

            if force_refresh:
                # Force refresh, dont get from memcache
                result = None
            else:
                result = memcache.get(mc_key)
                if result == "MCDUMMY":
                    result = None
            if result is not None:
                pass
            else:
                result = fn(*args, **kwargs)
                try:
                    memcache.set(mc_key, result, time=expiration)
                except ValueError, e:
                    logging.critical(
                        "Recevied error from memcache", exc_info=e)
            return result
        return cache_decorator
    return wrapper
