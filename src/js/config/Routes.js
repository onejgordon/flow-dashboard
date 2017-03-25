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
var Reading = require('components/Reading');
var Integrations = require('components/Integrations');
var Reports = require('components/Reports');
var AdminAgent = require('components/admin/AdminAgent');

// Analysis
var AnalysisGoals = require('components/analysis/AnalysisGoals');
var AnalysisJournals = require('components/analysis/AnalysisJournals');
var AnalysisTasks = require('components/analysis/AnalysisTasks');
var AnalysisHabits = require('components/analysis/AnalysisHabits');
var AnalysisMisc = require('components/analysis/AnalysisMisc');

var NotFound = require('components/NotFound');

var Router = require('react-router');

var Route = Router.Route;
var IndexRedirect = Router.IndexRedirect;

module.exports = (
  <Route component={Site} path="/">
    <IndexRedirect to="/app" />
    <Route path="auth/:provider" component={Auth} />
    <Route path="app" component={App}>
      <IndexRedirect to="/app/splash" />
      <Route path="splash" component={Splash} />
      <Route path="about" component={About} />
      <Route path="dashboard" component={Dashboard} />
      <Route path="timeline" component={Timeline} />
      <Route path="manage" component={Manage} />
      <Route path="integrations" component={Integrations} />
      <Route path="integrations/:action" component={Integrations} />
      <Route path="reports" component={Reports} />
      <Route path="reading" component={Reading} />
      <Route path="admin/agent" component={AdminAgent} />
      <Route path="analysis" component={Analysis}>
        <IndexRedirect to="/app/analysis/goals" />
        <Route path="goals" component={AnalysisGoals} />
        <Route path="journals" component={AnalysisJournals} />
        <Route path="tasks" component={AnalysisTasks} />
        <Route path="habits" component={AnalysisHabits} />
        <Route path="misc" component={AnalysisMisc} />
      </Route>
    </Route>
    <Route path="*" component={NotFound} />
  </Route>
);