#!/bin/bash
module=${1:-all}
sudo python runtests.py ~/google-cloud-sdk/platform/google_appengine ../testing/ $module