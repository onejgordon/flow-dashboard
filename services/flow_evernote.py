#!/usr/bin/python
# -*- coding: utf-8 -*-

# API calls to interact with Evernote
# https://github.com/evernote/evernote-sdk-python

import logging
from datetime import datetime
from evernote.api.client import EvernoteClient
import re
from google.appengine.api import memcache

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
    from settings.secrets import EVERNOTE_CONSUMER_KEY, EVERNOTE_CONSUMER_SECRET
    client = EvernoteClient(
        consumer_key=EVERNOTE_CONSUMER_KEY,
        consumer_secret=EVERNOTE_CONSUMER_SECRET,
        sandbox=SANDBOX
    )
    request_token = client.get_request_token(callback)
    # Save secret
    memcache.set(SECRET_MCK % user.key.id(), request_token['oauth_token_secret'])
    authorize_url = client.get_authorize_url(request_token)
    return authorize_url


def get_access_token(user, oauth_token, oauth_token_secret, oauth_verifier):
    '''
    Get request token
    '''
    from settings.secrets import EVERNOTE_CONSUMER_KEY, EVERNOTE_CONSUMER_SECRET
    client = EvernoteClient(
        consumer_key=EVERNOTE_CONSUMER_KEY,
        consumer_secret=EVERNOTE_CONSUMER_SECRET,
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
    client = EvernoteClient(token=access_token)
    userStore = client.get_user_store()
    en_user = userStore.getUser(access_token)
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