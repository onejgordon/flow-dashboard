var alt = require('config/alt');
import api from 'utils/api';
var util = require('utils/util');
import {clone} from 'lodash';
import {get} from 'utils/action-utils';

class ProjectActions {

	constructor() {
		// Automatic action
		this.generateActions();
	}

	// Manual actions

	fetchLinks() {
		return function(dispatch) {
			api.get("/api/link", {}, (res) => {
				dispatch(res);
		    });
		}
	}

	updateLink(data) {
		return function(dispatch) {
			api.post("/api/link", data, (res) => {
				dispatch(res);
		    });
		}
	}

}

module.exports = alt.createActions(ProjectActions);