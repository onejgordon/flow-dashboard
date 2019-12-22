var alt = require('config/alt');
var UserActions = require('actions/UserActions');
import { browserHistory } from 'react-router';
var AppConstants = require('constants/AppConstants');
var CryptoJS = require("crypto-js")

class UserStore {
    constructor() {
        this.bindActions(UserActions);
        this.user = null;
        this.user_encryption_key = sessionStorage.getItem(AppConstants.USER_LOCAL_ENCRYPTION_KEY)
        this.error = null;

        this.exportPublicMethods({
            get_user: this.get_user,
            admin: this.admin,
            plugin_enabled: this.plugin_enabled,
            request_scopes: this.request_scopes,
            encrypt_text: this.encrypt_text,
            decrypt_text: this.decrypt_text,
            encryption_key: this.encryption_key,
            encryption_key_verified: this.encryption_key_verified,
            encrypt_journal_text: this.encrypt_journal_text,
            decrypt_journal_text: this.decrypt_journal_text
        });
    }

    storeUser(user) {
        this.user = user;
        this.error = null;
        console.log("Stored user "+user.email);
        localStorage.setItem(AppConstants.USER_STORAGE_KEY, JSON.stringify(user));
    }

    storeVerifiedEncryptionKey(key) {
        this.user_encryption_key = key
        sessionStorage.setItem(AppConstants.USER_LOCAL_ENCRYPTION_KEY, key)
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
        this.user = null
        this.user_encryption_key = null
        sessionStorage.removeItem(AppConstants.USER_LOCAL_ENCRYPTION_KEY)
        localStorage.removeItem(AppConstants.USER_STORAGE_KEY);
    }

    onLogout(data) {
        if (data.success) {
            this.clearUser()
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

    // Public

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

    // Public methods for in-browser text encryption

    encryption_key() {
        let key = this.getState().user_encryption_key
        return key
    }

    encryption_key_verified() {
        return this.encryption_key() != null
    }

    encrypt_journal_text(questions, form_data) {
        questions.forEach((q) => {
            if (q.response_type == 'text') form_data[q.name] = this.encrypt_text(form_data[q.name]) // Replace with AES encrypted text
        })
        return form_data
    }

    decrypt_journal_text(questions, journal_data) {
        questions.forEach((q) => {
            let r = journal_data[q.name]
            if (q.response_type == 'text') journal_data[q.name] = this.decrypt_text(r)
        })
        return journal_data
    }

    encrypt_text(text) {
        let key = this.encryption_key()
        if (key != null) return CryptoJS.AES.encrypt(text, key).toString()
        else return null
    }

    decrypt_text(ciphertext) {
        let key = this.encryption_key()
        if (key != null) return CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8)
        else return '[ENCRYPTED]'
    }

}

module.exports = alt.createStore(UserStore, 'UserStore');
