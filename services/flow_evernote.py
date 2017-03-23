#!/usr/bin/python
# -*- coding: utf-8 -*-

# API calls to interact with Evernote
# https://github.com/evernote/evernote-sdk-python

import logging
from datetime import datetime
from evernote.api.client import EvernoteClient
import re
from google.appengine.api import memcache


SANDBOX = True
USE_DEV_TOKEN = True


def get_request_token(user, base):
    '''
    Get request token
    '''
    from secrets import EVERNOTE_CONSUMER_KEY, EVERNOTE_CONSUMER_SECRET
    user.get_integration_prop('evernote_access_token')
    client = EvernoteClient(
        consumer_key=EVERNOTE_CONSUMER_KEY,
        consumer_secret=EVERNOTE_CONSUMER_SECRET,
        sandbox=SANDBOX
    )
    callback = base
    request_token = client.get_request_token(callback)
    authorize_url = client.get_authorize_url(request_token)
    access_token = client.get_access_token(
        request_token['oauth_token'],
        request_token['oauth_token_secret'],
        ''  # verifier
    )
    return (authorize_url, access_token)


def get_note(user, note_id):
    title = content = None
    from secrets import EVERNOTE_DEV_TOKEN
    if USE_DEV_TOKEN:
        access_token = EVERNOTE_DEV_TOKEN
    else:
        access_token = user.get_integration_prop('evernote_access_token')
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
    from secrets import EVERNOTE_DEV_TOKEN
    client = EvernoteClient(token=EVERNOTE_DEV_TOKEN)
    noteStore = client.get_note_store()
    print noteStore.getNote("x")