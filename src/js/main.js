var React = require('react');
var ReactDOM = require('react-dom');
import { Router, browserHistory } from 'react-router';
// Browser ES6 Polyfill
require('babel/polyfill');
var routes = require('config/Routes');
ReactDOM.render(<Router routes={routes} history={browserHistory} />, document.getElementById('app'));
