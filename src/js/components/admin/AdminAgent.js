var React = require('react');

var util = require('utils/util');
var UserStore = require('stores/UserStore');
import {RaisedButton, TextField} from 'material-ui';
var api = require('utils/api');
import connectToStores from 'alt-utils/lib/connectToStores';
var toastr = require('toastr');
import {changeHandler} from 'utils/component-utils';

@connectToStores
@changeHandler
export default class AdminAgent extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
        this.state = {
            form: {
                message: ''
            }
        };
    }

    static getStores() {
        return [UserStore];
    }

    static getPropsFromStores() {
        return UserStore.getState();
    }

    componentDidMount() {

    }

    send() {
        let {form} = this.state;
        api.post("/api/agent/spoof", form, (res) => {

        });
    }

    render() {
        let {form} = this.state;
        return (
            <div>

                <h1>Test Agent</h1>

                <TextField name="message" value={form.message} onChange={this.changeHandler.bind(this, 'form', 'message')} />
                <RaisedButton label="Send" onClick={this.send.bind(this)} />
            </div>
        );
    }
};

module.exports = AdminAgent;
