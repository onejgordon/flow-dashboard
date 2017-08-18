#!/bin/bash
module=${1:-all}

sudo ./runtests.py ~/google-cloud-sdk/platform/google_appengine ../testing/ $module