var React = require('react');

var Site = require('components/Site');
var App = require('components/App');
var Dashboard = require('components/Dashboard');
var Timeline = require('components/Timeline');
var Splash = require('components/Splash');
var About = require('components/About');
var Privacy = require('components/Privacy');
var Auth = require('components/Auth');
var Settings = require('components/Settings');
var Analysis = require('components/Analysis');
var Reading = require('components/Reading');
var JournalHistory = require('components/JournalHistory');
var TaskHistory = require('components/TaskHistory');
var HabitHistory = require('components/HabitHistory');
var TrackingHistory = require('components/TrackingHistory');
var Integrations = require('components/Integrations');
var Reports = require('components/Reports');
var Feedback = require('components/Feedback');
var AdminAgent = require('components/admin/AdminAgent');

// Analysis
var AnalysisGoals = require('components/analysis/AnalysisGoals');
var AnalysisJournals = require('components/analysis/AnalysisJournals');
var AnalysisTasks = require('components/analysis/AnalysisTasks');
var AnalysisHabits = require('components/analysis/AnalysisHabits');
var AnalysisSnapshot = require('components/analysis/AnalysisSnapshot');
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
      <IndexRedirect to="/app/about" />
      <Route path="splash" component={Splash} />
      <Route path="login" component={Splash} />
      <Route path="about" component={About} />
      <Route path="privacy" component={Privacy} />
      <Route path="dashboard" component={Dashboard} />
      <Route path="timeline" component={Timeline} />
      <Route path="settings" component={Settings} />
      <Route path="integrations" component={Integrations} />
      <Route path="integrations/:action" component={Integrations} />
      <Route path="exports" component={Reports} />
      <Route path="reading" component={Reading} />
      <Route path="journal/history" component={JournalHistory} />
      <Route path="task/history" component={TaskHistory} />
      <Route path="habit/history" component={HabitHistory} />
      <Route path="tracking/history" component={TrackingHistory} />
      <Route path="feedback" component={Feedback} />
      <Route path="admin/agent" component={AdminAgent} />
      <Route path="analysis" component={Analysis}>
        <IndexRedirect to="/app/analysis/goals" />
        <Route path="goals" component={AnalysisGoals} />
        <Route path="journals" component={AnalysisJournals} />
        <Route path="tasks" component={AnalysisTasks} />
        <Route path="habits" component={AnalysisHabits} />
        <Route path="snapshots" component={AnalysisSnapshot} />
        <Route path="misc" component={AnalysisMisc} />
      </Route>
    </Route>
    <Route path="*" component={NotFound} />
  </Route>
);