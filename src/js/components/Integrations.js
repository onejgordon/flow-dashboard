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
        let action = this.props.location.query.action;
        if (action) {
            if (action == 'pocket_finish') {
                this.finish_pocket_authentication();
            }
        }
    }

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

    handleSnackClose() {
        this.setState({snack_open: false});
    }

    render() {
        let {form} = this.state;
        let test = true;
        let {user} = this.props;
        let gr_user_id, gh_user, gh_pat;
        if (user && user.integrations) {
            let ints = user.integrations;
            gr_user_id = ints.goodreads_user_id;
            gh_user = ints.github_username;
            gh_pat = ints.github_pat;
        }
        let pocket_connected = user.integrations && user.integrations.pocket_access_token != null;
        return (
            <div>

                <h1>Integrations</h1>

                <Tabs>
                    <Tab label="Pocket">

                        <FlatButton label={ pocket_connected ? "Connected" : "Connect" } onClick={this.start_pocket_authentication.bind(this)} disabled={pocket_connected}/>
                        <div hidden={!pocket_connected}>
                            <FlatButton label="Disconnect" onClick={this.disconnect_pocket.bind(this)} />
                        </div>
                    </Tab>

                    <Tab label="Good Reads">

                        <b>Current User ID:</b> <span>{ gr_user_id || "--" }</span><br/>
                        <TextField name="user_id" placeholder="Good Reads User ID" value={form.goodreads_user_id} onChange={this.changeHandler.bind(this, 'form', 'goodreads_user_id')} /><br/>

                        <RaisedButton label="Save" onClick={this.save_integration_props.bind(this, ['goodreads_user_id'])} />
                    </Tab>

                    <Tab label="Github">

                        <b>Current Github Username:</b> <span>{ gh_user || "--" }</span><br/>
                        <b>Current Github PAT:</b> <span>{ gh_pat || "--" }</span><br/>
                        <TextField name="gh_username" placeholder="Github User ID" value={form.github_username} onChange={this.changeHandler.bind(this, 'form', 'github_username')} /><br/>
                        <TextField name="gh_pat" placeholder="Github Personal Access Token (PAT)" value={form.github_pat} onChange={this.changeHandler.bind(this, 'form', 'github_pat')} /><br/>

                        <RaisedButton label="Save" onClick={this.save_integration_props.bind(this, ['github_username', 'github_pat'])} />
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
