#!/usr/bin/python
# -*- coding: utf-8 -*-

# API calls to interact with Evernote
# https://github.com/evernote/evernote-sdk-python

import logging
from datetime import datetime
from evernote.api.client import EvernoteClient
from evernote.edam.error.ttypes import EDAMSystemException
import re
from google.appengine.api import memcache
import imp
try:
    imp.find_module('secrets', ['settings'])
except ImportError:
    import secrets_template as secrets
else:
    from settings import secrets

SANDBOX = False
USE_DEV_TOKEN = False
SECRET_MCK = "user:%s:evernote:secret"


def user_access_token(user):
    from settings.secrets import EVERNOTE_DEV_TOKEN
    if USE_DEV_TOKEN:
        access_token = EVERNOTE_DEV_TOKEN
    else:
        access_token = user.get_integration_prop('evernote_access_token')
    return access_token


def get_request_token(user, callback):
    '''
    Get request token
    '''
    client = EvernoteClient(
        consumer_key=secrets.EVERNOTE_CONSUMER_KEY,
        consumer_secret=secrets.EVERNOTE_CONSUMER_SECRET,
        sandbox=SANDBOX
    )
    request_token = client.get_request_token(callback)
    logging.debug(request_token)
    # Save secret
    memcache.set(SECRET_MCK % user.key.id(), request_token['oauth_token_secret'])
    authorize_url = client.get_authorize_url(request_token)
    return authorize_url


def get_access_token(user, oauth_token, oauth_token_secret, oauth_verifier):
    '''
    Get request token
    '''

    client = EvernoteClient(
        consumer_key=secrets.EVERNOTE_CONSUMER_KEY,
        consumer_secret=secrets.EVERNOTE_CONSUMER_SECRET,
        sandbox=SANDBOX
    )
    access_token = en_user = None
    oauth_token_secret = memcache.get(SECRET_MCK % user.key.id())
    if oauth_token_secret:
        access_token = client.get_access_token(
            oauth_token,
            oauth_token_secret,
            oauth_verifier
        )
        if access_token:
            en_user = get_evernote_user(access_token)
    else:
        logging.warning("oauth_token_secret unavailable")
    return (access_token, en_user)


def get_evernote_user(access_token):
    client = EvernoteClient(token=access_token,
                            consumer_key=secrets.EVERNOTE_CONSUMER_KEY,
                            consumer_secret=secrets.EVERNOTE_CONSUMER_SECRET)
    userStore = client.get_user_store()
    en_user = None
    try:
        en_user = userStore.getUser(access_token)
    except EDAMSystemException, e:
        logging.error(str(e))
    return en_user


def get_note(user, note_id):
    title = content = None
    access_token = user_access_token(user)
    if access_token:
        client = EvernoteClient(token=access_token)
        noteStore = client.get_note_store()
        note = noteStore.getNote(access_token, note_id, True, False, False, False)
        if note:
            logging.debug(note)
            m = re.search(r'<en-note>(.*)<\/en-note>', note.content)
            if m:
                content = m.groups()[0]
                title = note.title
    else:
        logging.warning("Access token not available")
    return (title, content)

if __name__ == "__main__":
    from settings.secrets import EVERNOTE_DEV_TOKEN
    client = EvernoteClient(token=EVERNOTE_DEV_TOKEN)
    noteStore = client.get_note_store()
    print noteStore.getNote("x")