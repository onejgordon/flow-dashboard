# Contributing

Thanks for your interest in Flow Dashboard. All forms of contribution are
welcome, from issue reports to PRs.

* We use node.js v3 for development and testing.

## Code structure

Key files:

* `models.py` - All db model definitions, most with Update() and Fetch() methods
* `flow.py` - WSGI app setup and route lookup for all handlers and API calls
* `api.py` - All API calls
* `Routes.js` - Core react-router routes /app etc
* `App.js` - Component for main app frame, renders all sub-routes as children
* `Dashboard.js` - Dashboard component, renders each dashboard widget, etc

## Before you open a PR

* See README.md for setup instructions
* Make sure there's an issue open for any work you take on and intend to submit
as a pull request - it helps to review your concept and direction
early and is a good way to discuss what you're planning to do.
* If you open an issue and are interested in working on a fix, please let us
know. We'll help you get started, rather than adding it to the queue.
* Where possible, include tests with your changes, either that demonstrates the
bug, or tests the new functionality. If you're not sure how to test your
changes, feel free to ping @onejgordon

