var React = require('react');

var Site = require('components/Site');
var App = require('components/App');
var Dashboard = require('components/Dashboard');
var Timeline = require('components/Timeline');
var Splash = require('components/Splash');
var About = require('components/About');
var Auth = require('components/Auth');
var Manage = require('components/Manage');
var Analysis = require('components/Analysis');
var Integrations = require('components/Integrations');

var NotFound = require('components/NotFound');

var Router = require('react-router');

var Route = Router.Route;
var IndexRedirect = Router.IndexRedirect;

module.exports = (
  <Route component={Site} path="/">
    <IndexRedirect to="/app" />
    <Route path="app" component={App}>
      <IndexRedirect to="/app/splash" />
      <Route path="splash" component={Splash} />
      <Route path="about" component={About} />
      <Route path="auth" component={Auth} />
      <Route path="dashboard" component={Dashboard} />
      <Route path="timeline" component={Timeline} />
      <Route path="manage" component={Manage} />
      <Route path="integrations" component={Integrations} />
      <Route path="analysis" component={Analysis} />
    </Route>
    <Route path="*" component={NotFound} />
  </Route>
);