# Flow Dashboard

[![Build Status](https://travis-ci.org/onejgordon/flow-dashboard.svg?branch=master)](https://travis-ci.org/onejgordon/flow-dashboard)
[![Code Climate](https://lima.codeclimate.com/github/onejgordon/flow-dashboard/badges/gpa.svg)](https://lima.codeclimate.com/github/onejgordon/flow-dashboard)

## Purpose

Flow is a habit tracker and personal data analytics app that lets you keep focus on what matters. Flow owns none of your data. That's yours.

If you just want look around, you can create an account at http://flowdash.co.

To spin up your own instance, or start contributing to this repo, see below.

## Setup

To deploy a new instance of Flow, use the following instructions.

### Obtain Google App Engine SDK

Download the Cloud SDK from Google.
`https://cloud.google.com/appengine/downloads`

### Create a branch or fork the repo

Branch or fork this repository into a project directory.

Ensure you have npm and gulp installed.

```
npm install -g gulp
npm install
```

In a terminal, visit the project's directory, and run `gulp`. This compiles source files and watches src directories for changes.

### Setup a new Google Cloud project

Visit the Google developer's console: <https://console.developers.google.com/>
Create a new project and choose a unique project ID. You will not need a billing account if usage remains within Google's free tier, which should support low-mid volume use cases.

### Set up a gcloud config

```
gcloud config configurations create [my-flow-config-name]
gcloud config set project [project-id]
gcloud config set account [my email]

```

### Update code configuration

Update the APP_OWNER variable in constants.py. Owner should match the Google account you logged into the console with. This will enable the application to send emails.

Create secrets.py, client_secrets.js from the templates.

### Run the dev server locally

Make sure dev_appserver.py is in your path, and run `./server.sh` to start the dev server locally, and gulp to build JS etc.

### Deploy

`./deploy.sh 0-1` to deploy a new version 0-1 and set is as default

Visit `https://[project-id].appspot.com` to see the app live.

## Features

* Projects & progress tracking
	* Track time of each progress increment
* Daily journal / survey
	* How was your day?
	* How will tomorrow be?
	* 10 words
	* Optional location pickup
	* Optional activities (remembered auto-complete)
	* Extract @mentions and #tags from configured open-ended responses (auto-complete)
* Top tasks for tomorrow (also created from journal)
* Habit tracking ala habits app
	* With weekly targets
	* Commitments
* Monthly/year goals & assessments
* Reading widget
	* Show currently-reading shelf on Good Reads
* Flash card widget for spreadsheet access (e.g. random quotes, papers)
* Store productivity metrics e.g. github commits (daily, hourly)
	* Scrape Github commits chart
* Keyboard shortcuts (h/t)
* Analysis
	* Segment analysis of journals by tag (highlight journal days with/without + show averages)
* Google Assitant / Home integration for actions like:
	* "How am I doing"
	* "What are my goals for this month"
	* "Mark 'run' as complete"

## Google Home Integration

We've used API.AI to create an agent that integrates with Google Actions / Assistant / Home. To connect Assistant with a new instance of Flow:

1. Create and deploy for preview a new agent
2. Set up an intent to handle requests
3. Add `/api/integrations/googlehome/request` as a webhook
4. Add 'Actions on Google' integration
5. Preview the integration using the web preview

using API.AI.

## Planned Features

* HTML5 cache manifest
* Track happiness / activities throughout day (push), ala https://www.trackyourhappiness.org/
* Actual book start date Readable (good reads)
* Desktop notifs
* Push panel data to compute engine for ML / prediction / regression
* Project completion view (burn up)
* Mobile app via react-native?
* Mapped journals

