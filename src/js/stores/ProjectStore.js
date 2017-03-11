var alt = require('config/alt');
var ProjectActions = require('actions/ProjectActions');
import {findItemById, findIndexById} from 'utils/store-utils';
import {isEmpty} from 'lodash';
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');

class ProjectStore {
    constructor() {
        this.bindActions(ProjectActions);

        // Store
        this.links = [];

        this.exportPublicMethods({

        });

    }

    onFetchLinks(data) {
        if (data.success) {
            this.links = data.links;
        }
    }

    onUpdateLink(res) {
        let idx = findIndexById(this.links, res.link, 'id');
        if (idx > -1) this.links[idx] = res.link;
        else this.links.push(res.link);
    }

    // Public

    mckey(svc, date) {
        // Sync with api.py
        return svc+":"+util.printDateObj(date);
    }

	// Automatic


}

module.exports = alt.createStore(ProjectStore, 'ProjectStore');