var alt = require('config/alt');
var UserActions = require('actions/UserActions');
import { browserHistory } from 'react-router';
var AppConstants = require('constants/AppConstants');

class UserStore {
    constructor() {
        this.bindActions(UserActions);
        this.user = null;
        this.error = null;

        this.exportPublicMethods({
            get_user: this.get_user,
            admin: this.admin,
            request_scopes: this.request_scopes
        });
    }

    storeUser(user) {
        this.user = user;
        this.error = null;
        console.log("Stored user "+user.email);
        // api.updateToken(user.token);
        localStorage.setItem(AppConstants.USER_STORAGE_KEY, JSON.stringify(user));
    }

    request_scopes(scopes_array, cb, cb_fail) {
        var auth2 = gapi.auth2.getAuthInstance();
        var guser = auth2.currentUser.get();
        let granted_scopes = guser.getGrantedScopes();
        console.log('granted', granted_scopes);
        let scopes_needed = [];
        scopes_array.forEach((scope) => {
            if (!granted_scopes || granted_scopes.indexOf(scope) == -1) scopes_needed.push(scope);
        });
        if (scopes_needed.length > 0) {
            guser.grant({'scope': scopes_needed.join(' ')}).then(cb, cb_fail);
        } else {
            console.log('we have all requested scopes');
            cb();
        }
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
            console.log('Signed out of Flow');
            var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
                console.log('Signed out of Google');
                browserHistory.push('/app');
            });
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

    plugin_enabled(plugin) {
        let plugins = this.getState().user.plugins;
        return plugins != null && plugins.indexOf(plugin) > -1;
    }

    admin() {
        return this.getState().user.level == AppConstants.USER_ADMIN;
    }

}

module.exports = alt.createStore(UserStore, 'UserStore');
