# Flow Dashboard

[![Build Status](https://travis-ci.org/onejgordon/flow-dashboard.svg?branch=master)](https://travis-ci.org/onejgordon/flow-dashboard)
[![Code Climate](https://lima.codeclimate.com/github/onejgordon/flow-dashboard/badges/gpa.svg)](https://lima.codeclimate.com/github/onejgordon/flow-dashboard)

## Purpose

Flow is a habit tracker and personal data analytics app that lets you keep focus on what matters. Flow owns none of your data. That's yours.

If you just want look around or get started with Flow, you can create a free account at http://flowdash.co.

To spin up your own instance, or start contributing to this repo, see below.

## Setup

To deploy a new instance of Flow, use the following instructions.

### Obtain Google App Engine SDK

Download the Cloud SDK from Google.
`https://cloud.google.com/appengine/downloads`

### Fork the repo

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
	* Configurable questions
	* Optional location pickup & mapping
	* Extract @mentions and #tags from configured open-ended responses (auto-suggest)
* Habit tracking ala habits app
	* With weekly targets
	* Commitments
* Tracking top tasks for each day (submitted with journal)
* Monthly/year goals & assessments
* Store productivity metrics e.g. github commits (daily, hourly)
	* Scrape Github commits chart
* Keyboard shortcuts (h/t)
* Analysis
	* Segment analysis of journals by tag (highlight journal days with/without + show averages)
* Google Assitant / Home integration for actions like:
	* "How am I doing"
	* "What are my goals for this month"
	* "Mark 'run' as complete"
* Reading widget
	* Show currently-reading shelf on Good Reads / Pocket
* Flash card widget for spreadsheet access (e.g. random quotes, papers)

## Google Home Integration

We've used API.AI to create an agent that integrates with Google Actions / Assistant / Home. To connect Assistant with a new instance of Flow:

1. Visit https://api.ai
2. Update the agent.json configuration file in static/flow-agent
3. Fill in config params in [Brackets] with your configuration / webhook URLs, etc
4. Import the agent.json to API.AI
5. Go to integrations and add and authorize 'Actions on Google'
6. Preview the integration using the web preview


## Planned Features

* Submit daily reports through agent
* Track happiness / activities throughout day (push), ala https://www.trackyourhappiness.org/
* Actual book start date Readable (good reads)
* Desktop notifs
* Push panel data to compute engine for ML / prediction / regression
* Project completion view (burn up)
* Mobile app via react-native?

