#!/bin/bash
module=${1:-all}

sudo ./runtests.py /usr/local/google_appengine ../testing/ $module