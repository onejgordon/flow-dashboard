var React = require('react');

var UserStore = require('stores/UserStore');
import {TextField, RaisedButton, FlatButton} from 'material-ui';
var api = require('utils/api');
var util = require('utils/util');
import connectToStores from 'alt-utils/lib/connectToStores';
import {changeHandler} from 'utils/component-utils';

@connectToStores
@changeHandler
export default class Feedback extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
        this.state = {
            form: {
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
        util.set_title("Feedback");
    }

    submit() {
        let {form} = this.state;
        let {user} = this.props;
        if (user && form.feedback) {
            var data = {
                feedback: form.feedback,
                email: user.email
            }
            api.post("/api/feedback", data, (res) => {
                this.setState({form: {}});
            })
        }
    }

    render() {
        let {form} = this.state;
        let {user} = this.props
        return (
            <div>

                <h1>Feedback</h1>

                <TextField placeholder="Questions, comments, feedback, or issues? Enter it all here"
                           value={form.feedback || ''}
                           multiLine={true}
                           onChange={this.changeHandler.bind(this, 'form', 'feedback')}
                           fullWidth />

                <p className="vpad">Your message will be sent as <b>{ user.email }</b>.</p>

                <br/>
                <RaisedButton label="Send Feedback" primary={true} onClick={this.submit.bind(this)} />

                <div className="row">
                    <div className="col-sm-6">
                        <h3 className="vspace">Or, want to file a bug report?</h3>

                        <p className="lead">Please create an issue on <a href="https://github.com/onejgordon/flow-dashboard/issues" target="_blank">Github</a>.</p>

                    </div>
                    
                </div>
            </div>
        );
    }
};

module.exports = Feedback;
