var React = require('react');

var util = require('utils/util');
var UserStore = require('stores/UserStore');
var UserActions = require('actions/UserActions');
var AppConstants = require('constants/AppConstants');
var SimpleAdmin = require('components/common/SimpleAdmin');
var LoadStatus = require('components/common/LoadStatus');
import {Tabs, Tab, FontIcon, FlatButton, RaisedButton, TextField, Snackbar} from 'material-ui';
import {GR_API_KEY} from 'constants/client_secrets';
var api = require('utils/api');
import connectToStores from 'alt-utils/lib/connectToStores';
var toastr = require('toastr');
import {browserHistory} from 'react-router';
import {changeHandler} from 'utils/component-utils';

@connectToStores
@changeHandler
export default class Integrations extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
        this.state = {
            form: {
            },
            snack_message: null,
            snack_open: false
        };
    }

    static getStores() {
        return [UserStore];
    }

    static getPropsFromStores() {
        return UserStore.getState();
    }

    componentDidMount() {
        let action = this.props.location.query.action || this.props.params.action;
        console.log('action: ' + action);
        if (action) {
            if (action == 'pocket_finish') {
                this.finish_pocket_authentication();
            } else if (action == 'evernote_connect') {
                this.finish_evernote_authentication();
            }
        }
    }

    // Pocket

    start_pocket_authentication() {
        this.setState({snack_message: "Pocket connecting...", snack_open: true})
        api.post("/api/integrations/pocket/authenticate", {}, (res) => {
            if (res.redirect) window.location = res.redirect;
        });
    }

    finish_pocket_authentication() {
        this.setState({snack_message: "Signing in to Pocket...", snack_open: true})
        api.post("/api/integrations/pocket/authorize", {}, (res) => {
            if (res.user) {
                UserActions.storeUser(res.user);
                this.setState({snack_message: "Pocket connected!", snack_open: true})
                browserHistory.push('/app/integrations');
            }
        });
    }

    disconnect_pocket() {
        this.setState({snack_message: "Disconnecting from Pocket...", snack_open: true})
        api.post("/api/integrations/pocket/disconnect", {}, (res) => {
            if (res.user) {
                UserActions.storeUser(res.user);
            }
        });
    }

    // Evernote

    start_evernote_authentication() {
        this.setState({snack_message: "Evernote connecting...", snack_open: true})
        api.post("/api/integrations/evernote/authenticate", {}, (res) => {
            if (res.redirect) window.location = res.redirect;
        });
    }

    finish_evernote_authentication() {
        this.setState({snack_message: "Signing in to Evernote...", snack_open: true})
        let params = this.props.location.query;
        api.post("/api/integrations/evernote/authorize", params, (res) => {
            if (res.user) {
                UserActions.storeUser(res.user);
                this.setState({snack_message: "Evernote connected!", snack_open: true})
                browserHistory.push('/app/integrations');
            }
        });
    }

    disconnect_evernote() {
        this.setState({snack_message: "Disconnecting from Evernote...", snack_open: true})
        api.post("/api/integrations/evernote/disconnect", {}, (res) => {
            if (res.user) {
                UserActions.storeUser(res.user);
            }
        });
    }

    save_integration_props(props) {
        let {form} = this.state;
        let params = {};
        props.forEach((prop) => {
            params[prop] = form[prop];
        })
        params.props = props.join(',');
        api.post("/api/integrations/update_integration_settings", params, (res) => {
            if (res.user) {
                UserActions.storeUser(res.user);
            }
        });
    }

    authenticate_google_service(service_name) {
        api.get(`/api/auth/google/${service_name}/authenticate`, {}, (res) => {
            if (res.uri) window.location = res.uri;
        });
    }

    google_disconnect() {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.disconnect();
        toastr.success("Disconnected Google authorization.")
    }

    handleSnackClose() {
        this.setState({snack_open: false});
    }

    render() {
        let {form} = this.state;
        let test = true;
        let {user} = this.props;
        if (!user) return;
        let gr_user_id, gh_user, gh_pat, en_notebook_ids, evernote_connected;
        if (user && user.integrations) {
            let ints = user.integrations;
            gr_user_id = ints.goodreads_user_id;
            gh_user = ints.github_username;
            gh_pat = ints.github_pat;
            en_notebook_ids = ints.evernote_notebook_ids;
            evernote_connected = ints.evernote_access_token != null;
        }
        let pocket_connected = user.integrations && user.integrations.pocket_access_token != null;
        return (
            <div>

                <h1>Integrations</h1>

                <Tabs>
                    <Tab label="Pocket">

                        <p className="lead">Your reading list will be synced daily from Pocket.</p>

                        <FlatButton label={ pocket_connected ? "Connected" : "Connect" } onClick={this.start_pocket_authentication.bind(this)} disabled={pocket_connected}/>
                        <div hidden={!pocket_connected}>
                            <FlatButton label="Disconnect" onClick={this.disconnect_pocket.bind(this)} />
                        </div>
                    </Tab>

                    <Tab label="Evernote">

                        <p className="lead">Flow will receive new notes/quotes/excerpts added to specified notebooks on Evernote.</p>

                        <FlatButton label={ evernote_connected ? "Connected" : "Connect" } onClick={this.start_evernote_authentication.bind(this)} disabled={evernote_connected}/>
                        <div hidden={!evernote_connected}>
                            <FlatButton label="Disconnect" onClick={this.disconnect_evernote.bind(this)} /><br/>

                            <b>Evernote User ID:</b> <span>{ user.evernote_id || "--" }</span><br/>
                            <b>Capture Notebook IDs:</b> <span>{ en_notebook_ids || "--" }</span><br/>
                            <TextField name="user_id" placeholder="Evernote Notebook IDs (comma separated)" value={form.evernote_notebook_ids} onChange={this.changeHandler.bind(this, 'form', 'evernote_notebook_ids')} fullWidth /><br/>

                            <RaisedButton label="Save" onClick={this.save_integration_props.bind(this, ['evernote_notebook_ids'])} />

                        </div>
                    </Tab>

                    <Tab label="Good Reads">

                        <p className="lead">Your currently reading shelf list will be synced daily from Goodreads.</p>

                        <b>Current User ID:</b> <span>{ gr_user_id || "--" }</span><br/>
                        <TextField name="user_id" placeholder="Goodreads User ID" value={form.goodreads_user_id} onChange={this.changeHandler.bind(this, 'form', 'goodreads_user_id')} /><br/>

                        <RaisedButton label="Save" onClick={this.save_integration_props.bind(this, ['goodreads_user_id'])} />
                    </Tab>

                    <Tab label="Github">

                        <p className="lead">Public commit counts from your profile will be synced daily.</p>

                        <b>Current Github Username:</b> <span>{ gh_user || "--" }</span><br/>
                        <b>Current Github PAT:</b> <span>{ gh_pat || "--" }</span><br/>
                        <TextField name="gh_username" placeholder="Github User ID" value={form.github_username} onChange={this.changeHandler.bind(this, 'form', 'github_username')} /><br/>
                        <TextField name="gh_pat" placeholder="Github Personal Access Token (PAT)" value={form.github_pat} onChange={this.changeHandler.bind(this, 'form', 'github_pat')} /><br/>

                        <RaisedButton label="Save" onClick={this.save_integration_props.bind(this, ['github_username', 'github_pat'])} />
                    </Tab>

                    <Tab label="Google">
                        <FlatButton label="Disconnect" onClick={this.google_disconnect.bind(this)} />
                    </Tab>

                    <Tab label="Google Fit">
                        <FlatButton label="Authenticate" onClick={this.authenticate_google_service.bind(this, 'fit')} />
                    </Tab>

                </Tabs>

                <Snackbar message={this.state.snack_message || ""}
                    open={this.state.snack_open}
                    onRequestClose={this.handleSnackClose.bind(this)}
                    autoHideDuration={4000} />
            </div>
        );
    }
};

module.exports = Integrations;
