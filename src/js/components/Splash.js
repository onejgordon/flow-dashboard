var React = require('react');
var AppConstants = require('constants/AppConstants');
import {Link} from 'react-router';
import GoogleLogin from 'react-google-login';
import {RaisedButton, Snackbar} from 'material-ui';
import {G_OAUTH_CLIENT_ID, DEV_G_OAUTH_CLIENT_ID, DEV_GOOGLE_API_KEY, GOOGLE_API_KEY} from 'constants/client_secrets';
var client_secrets = require('constants/client_secrets');

export default class Splash extends React.Component {
    static defaultProps = {
        signing_in: false
    }
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    success(gUser) {
    }

    fail(res) {
        console.log(res)
    }

    render() {
        let SITENAME = AppConstants.SITENAME;
        let {user, signing_in} = this.props;
        let snack_message = "Signing you in...";
        let cta = user ? `Welcome back to ${SITENAME}` : `Welcome to ${SITENAME}`;
        let oauth_client_id = constants.dev ? client_secrets.DEV_G_OAUTH_CLIENT_ID || client_secrets.G_OAUTH_CLIENT_ID : client_secrets.G_OAUTH_CLIENT_ID
        return (
            <div>

                <div className="text-center">

                    <h2 style={{marginTop: "140px", marginBottom: "60px"}}>{cta}</h2>

                    <p className="lead" style={{fontSize: "1.45em"}}>{ AppConstants.TAGLINE }</p>

                    <div hidden={!user}>
                        <Link to="/app/dashboard"><RaisedButton label="Your Dashboard" primary={true} /></Link>
                    </div>

                    <div hidden={user}>

                        <GoogleLogin
                            clientId={oauth_client_id}
                            buttonText="Sign In"
                            scope="profile email"
                            onSuccess={this.success.bind(this)}
                            onFailure={this.fail.bind(this)} />

                    <Snackbar message={snack_message}
                        open={signing_in}
                        autoHideDuration={4000} />

                    </div>

                </div>

            </div>
        );
    }
}
