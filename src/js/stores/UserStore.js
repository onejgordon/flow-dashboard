var alt = require('config/alt');
var UserActions = require('actions/UserActions');
import {findItemById, findIndexById} from 'utils/store-utils';
import { browserHistory } from 'react-router';
import {defer} from 'lodash';
var AppConstants = require('constants/AppConstants');

class UserStore {
    constructor() {
        this.bindActions(UserActions);
        this.user = null;
        this.error = null;

        this.exportPublicMethods({
            get_user: this.get_user,
            admin: this.admin,
            bank_connected: this.bank_connected
        });
    }

    storeUser(user) {
        this.user = user;
        this.error = null;
        console.log("Stored user "+user.email);
        // api.updateToken(user.token);
        localStorage.setItem(AppConstants.USER_STORAGE_KEY, JSON.stringify(user));
    }

    loadLocalUser() {
        var user;
        try {
            switch (AppConstants.PERSISTENCE) {
                case "bootstrap":
                alt.bootstrap(JSON.stringify(alt_bootstrap));
                break;
            }

        } finally {
            if (this.user) {
                console.log("Successfully loaded user " + this.user.email);
            }
        }
    }

    clearUser() {
        console.log("Clearing user after signout");
        this.user = null;
        localStorage.removeItem(AppConstants.USER_STORAGE_KEY);
    }

    onLogin(data) {
        if (data.ok) {
            // this.storeUser(data.user);
            // defer(browserHistory.push.bind(this, `/app/main`));
            window.location = data.redirect;
        } else {
            this.clearUser();
            this.error = data.error;
        }
    }

    onLogout(data) {
        if (data.success) {
            this.clearUser();
            this.error = null;
            browserHistory.push('/app/splash');
        }
    }

    onUpdate(data) {
        this.storeUser(data.user);
        if (data.oauth_uri != null) {
            window.location = data.oauth_uri;
        }
    }

    // Automatic

    get_user(uid) {
        var u = this.getState().users[uid];
        return u;
    }

    admin() {
        return this.getState().user.level == AppConstants.USER_ADMIN;
    }

    bank_connected() {
        let u = this.getState().user;
        return u && u.n_connected_accounts > 0;
    }

}

module.exports = alt.createStore(UserStore, 'UserStore');