var React = require('react');
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');
var api = require('utils/api');
var UserActions = require('actions/UserActions');
import {Link} from 'react-router';
import {RaisedButton, Dialog, IconButton,
    TextField, FlatButton, Paper} from 'material-ui';
var client_secrets = require('constants/client_secrets');
import {browserHistory} from 'react-router';

export default class About extends React.Component {
    static defaultProps = {}
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        let SITENAME = AppConstants.SITENAME;
        let {user} = this.props;
        return (
            <div>

                <div className="text-center">

                    <h2 style={{marginTop: "40px", marginBottom: "60px"}}>About</h2>

                    <p className="lead" style={{fontSize: "1.5em"}}>Flow is a habit tracker and personal data analytics app that lets you keep focus on what matters. Flow owns none of your data. That's yours.</p>

                    <div className="row">

                        <h3>The Flow Dashboard</h3>

                        <p className="lead" style={{fontSize: "1.5em"}}>Track habits, monthly and annual goals, and the top tasks of the day. Submit daily journals with customizable questions.</p>

                        <img src="/images/screenshots/dashboard.png" className="img-responsive" />

                        <h3>Your timeline.</h3>

                        <p className="lead" style={{fontSize: "1.5em"}}>A birds-eye-view of your life by weeks.</p>

                        <img src="/images/screenshots/timeline.png" className="img-responsive" />

                        <h3>Visualize everything.</h3>

                        <p className="lead" style={{fontSize: "1.5em"}}>Everything Flow collects can be visualized.</p>

                        <img src="/images/screenshots/analysis.png" className="img-responsive" />

                        <h3>Flow is Open Source</h3>

                        <p className="lead" style={{fontSize: "1.5em"}}>Spin up your own instance, or contribute.</p>

                        <a href="https://github.com/onejgordon/flow-dashboard" target="_blank"><RaisedButton label="Source on Github" /></a>

                    </div>
                </div>

            </div>
        );
    }
}
