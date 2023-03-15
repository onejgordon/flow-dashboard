var React = require('react');
import {RaisedButton, Snackbar} from 'material-ui';

const loadScript = (src) => {
    console.log("loadScript...")
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve()
        const script = document.createElement('script')
        script.src = src
        script.onload = () => resolve()
        script.onerror = (err) => reject(err)
        document.body.appendChild(script)
        console.log("Appended google auth script.");
    })
}

export default class GoogleLoginCompat extends React.Component {

    componentDidMount() {
        const src = 'https://accounts.google.com/gsi/client'
        const id = this.props.clientId;

        loadScript(src)
            .then(() => {
            /*global google*/
            console.log(google)
            google.accounts.id.initialize({
                client_id: id,
                callback: this.handleCredentialResponse,
            })
            google.accounts.id.renderButton(
                this.refs.googleButton, 
                { theme: 'outline', size: 'large' } 
            )
            })
            .catch(console.error)
    }

    componentWillUnmount() {
        const scriptTag = document.querySelector(`script[src="${src}"]`);
        if (scriptTag) document.body.removeChild(scriptTag);
    }

    handleCredentialResponse(response) {
        console.log("Encoded JWT ID token: " + response.credential);
        // Pass gUser back to parent
        console.log(response);
        this.props.onSuccess()
    }

    render() {
        return <div ref="googleButton"></div>
    }
}
