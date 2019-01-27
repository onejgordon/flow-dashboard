var alt = require('config/alt');
var api = require('utils/api');

class UserActions {

    constructor() {
        // Automatic action
        this.generateActions('loadLocalUser', 'storeUser', 'storeVerifiedEncryptionKey');
    }

    // Manual actions

    logout() {
        return function(dispatch) {
            try {
                api.get("/api/auth/logout", {}, (res) => {
                    dispatch({ success: res.success });
                });
            } catch (err) {
                console.error(err);
                dispatch({ok: false, error: err.data});
            }
        }
    }

    update(data) {
        return (dispatch) => {
            api.post("/api/user/me", data, (res) => {
                dispatch(res);
            })
        }
    }
}

module.exports = alt.createActions(UserActions);