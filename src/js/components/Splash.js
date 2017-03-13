var React = require('react');
var AppConstants = require('constants/AppConstants');
import {Link} from 'react-router';
import GoogleLogin from 'react-google-login';
import {RaisedButton} from 'material-ui';
var client_secrets = require('constants/client_secrets');

export default class Splash extends React.Component {
    static defaultProps = {}
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
        let {user} = this.props;
        let cta = user ? `Welcome back to ${SITENAME}` : `Welcome to ${SITENAME}`;
        return (
            <div>

                <div className="text-center">

                    <h2 style={{marginTop: "140px", marginBottom: "60px"}}>{cta}</h2>

                    <div hidden={!user}>
                        <Link to="/app/dashboard"><RaisedButton label="Your Dashboard" primary={true} /></Link>
                    </div>

                    <div hidden={user}>
                        <Link to="/app/about"><RaisedButton label="Learn More" /></Link>

                        <p style={{marginTop: "6px"}}>OR</p>

                        <GoogleLogin
                            clientId={client_secrets.G_OAUTH_CLIENT_ID}
                            buttonText="Login"
                            scope="profile email"
                            onSuccess={this.success.bind(this)}
                            onFailure={this.fail.bind(this)} />

                    </div>

                </div>

            </div>
        );
    }
}
