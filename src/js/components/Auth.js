var React = require('react');
var AppConstants = require('constants/AppConstants');
var api = require('utils/api');
import GoogleLogin from 'react-google-login';
var client_secrets = require('constants/client_secrets');
var toastr = require('toastr');

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

    get_provider() {
        let id = this.props.params.provider;
        return {
            google: {
                uri: '/api/auth/google_auth',
                params: ['client_id', 'redirect_uri', 'state', 'response_type'],
                name: "Google Assistant"
            },
            fbook: {
                uri: '/api/auth/fbook_auth',
                params: ['redirect_uri', 'account_linking_token'],
                name: "Facebook Messenger"
            }
        }[id]
    }

    finish_auth(id_token) {
        let provider = this.get_provider();
        if (provider) {
            let data = {};
            provider.params.forEach((p) => {
                data[p] = this.props.location.query[p];
            });
            if (id_token) data.id_token = id_token;
            api.post(provider.uri, data, (res) => {
                if (res.redirect) window.location = res.redirect;
                else if (res.error) toastr.error(res.error);
            });
        } else {
            toastr.error("Provider not found");
        }
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
        let provider = this.get_provider()
        return (
            <div>

                <div className="text-center">

                    <h2 style={{marginTop: "140px", marginBottom: "60px"}}>To connect to {provider.name}, sign in to {SITENAME}</h2>

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
