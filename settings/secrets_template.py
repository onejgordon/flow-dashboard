#!/usr/bin/python
# -*- coding: utf8 -*-

# Generate via os.urandom(48)
COOKIE_KEY = ''

# GCP project info
GOOGLE_PROJECT_ID = "flow-app-xxxx"
GOOGLE_PROJECT_NO = 0

# Create an oauth 2.0 web client ID from GCP console
# Configure our client ID with, authorized javascript origins:
# - https://[your-project-id].appspot.com
# - https://test-dot-[your-project-id].appspot.com (optional, to enable testing on a subversion)
# And authorised redirect URIs:
# - https://[your-project-id].appspot.com/api/auth/google/oauth2callback
# - http://localhost:8080/api/auth/google/oauth2callback
GOOGLE_CLIENT_ID = "######.XXXXXXXXXXXX.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = "XXXXXXXXX"

# Create a new API key from GCP console
G_MAPS_API_KEY = "XXXXXXXX"

# AES Cypher Key (generate with os.urandom(16))
AES_CYPHER_KEY = '16 byte key ....'

# Good Reads
GR_API_KEY = ""
GR_SECRET = ""

# Pocket
POCKET_CONSUMER_KEY = ""

# Evernote
EVERNOTE_CONSUMER_KEY = ""
EVERNOTE_CONSUMER_SECRET = ""
EVERNOTE_DEV_TOKEN = ""

FB_ACCESS_TOKEN = ""
FB_VERIFY_TOKEN = ""

API_AI_AUTH_KEY = ""
API_AI_FB_CALLBACK = ""
