var React = require('react');
var api = require('utils/api');
import {browserHistory} from 'react-router';
var UserActions = require('actions/UserActions');

const GSI_CLIENT_SRC = 'https://accounts.google.com/gsi/client';

const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve()
        const script = document.createElement('script')
        script.src = src
        script.onload = () => resolve()
        script.onerror = (err) => reject(err)
        document.body.appendChild(script)
    })
}

export default class GoogleLoginCompat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            signing_in: false
        }
    }

    componentDidMount() {
        
        const id = this.props.clientId;

        loadScript(GSI_CLIENT_SRC)
            .then(() => {
            /*global google*/
            console.log(google)
            google.accounts.id.initialize({
                client_id: id,
                callback: this.handleCredentialResponse.bind(this),
            })
            google.accounts.id.renderButton(
                this.refs.googleButton, 
                { theme: 'outline', size: 'large' } 
            )
            })
            .catch(console.error)
    }

    componentWillUnmount() {
        const scriptTag = document.querySelector(`script[src="${GSI_CLIENT_SRC}"]`);
        if (scriptTag) document.body.removeChild(scriptTag);
    }

    handleCredentialResponse(response) {
        this.verifyUser(response.credential);
    }

    verifyUser(credential) {
        const id_token = credential;
        let data = {token: id_token};
        this.setState({signing_in: true}, () => {
            api.post('/api/auth/google_login', data, (res) => {
                UserActions.storeUser(res.user);
                browserHistory.push('/app/dashboard');
                this.setState({signing_in: false});
                }, (res_fail) => {
                this.setState({signing_in: false});
            })
        });
    }    

    render() {
        return (
            <div>
                { this.state.signing_in ? <span>Signing in...</span> : null }
                <div ref="googleButton"></div>
            </div>
        )
    }
}
