var React = require('react');
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');
var api = require('utils/api');
var GoalViewer = require('components/GoalViewer');
var ProjectViewer = require('components/ProjectViewer');
var HabitWidget = require('components/HabitWidget');
var MiniJournalWidget = require('components/MiniJournalWidget');
var UserActions = require('actions/UserActions');
import {Link} from 'react-router';
import GoogleLogin from 'react-google-login';
import {clone, merge} from 'lodash';
import {RaisedButton, Dialog, IconButton,
    TextField, FlatButton, Paper} from 'material-ui';
var client_secrets = require('constants/client_secrets');
import {browserHistory} from 'react-router';

export default class Auth extends React.Component {
    static defaultProps = {}
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        if (this.props.user) this.finish_auth();
    }

    finish_auth(id_token) {
        let type = this.props.location.query.type;
        let {client_id, redirect_uri, state, response_type} = this.props.location.query;
        let data = {client_id, redirect_uri, state, response_type};
        if (id_token) data.id_token = id_token;
        var response = api.post('/api/auth/google_auth', data, (res) => {
            if (res.redirect) window.location = res.redirect;
        });
    }

    success(gUser) {
        var profile = gUser.getBasicProfile();
        var id_token = gUser.getAuthResponse().id_token;
        this.finish_auth(id_token);
    }

    fail(res) {
        console.log(res)
    }

    render() {
        let SITENAME = AppConstants.SITENAME;
        return (
            <div>

                <div className="text-center">

                    <h2 style={{marginTop: "140px", marginBottom: "60px"}}>To continue, sign in to {SITENAME}</h2>

                    <GoogleLogin
                        clientId={client_secrets.G_OAUTH_CLIENT_ID}
                        buttonText="Login"
                        scope="profile email https://www.googleapis.com/auth/spreadsheets.readonly"
                        onSuccess={this.success.bind(this)}
                        onFailure={this.fail.bind(this)} />
                </div>

            </div>
        );
    }
}
