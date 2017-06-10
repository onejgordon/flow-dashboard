var React = require('react');
var ReactDOM = require('react-dom');
import { BrowserRouter, Route } from 'react-router-dom';
var Site = require('components/Site');
// Browser ES6 Polyfill
require('babel/polyfill');
ReactDOM.render((
	<BrowserRouter>
		<div>
			<Route component={Site} path="/" />
		</div>
	</BrowserRouter>
	), document.getElementById('app'))
