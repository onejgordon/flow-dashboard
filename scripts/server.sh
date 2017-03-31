#!/bin/bash

cd ../
if [ "$1" == "kill" ]; then
	echo "Killing server..."
	lsof -P | grep ':8080' | awk '{print $2}' | xargs kill -9
elif [ "$1" == "clean" ]; then
	echo "Starting server (cleaning db)..."
	dev_appserver.py app.yaml --log_level=debug --clear_datastore=yes
else
	echo "Starting server..."
	dev_appserver.py app.yaml --log_level=debug
fi