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
                    <div className="col-sm-6">
                        <h3 className="vspace">Or, want to support me and Flow's continued development?</h3>

                        <p className="lead">Any amount of support is tremendously appreciated.</p>

                        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                            <input type="hidden" name="cmd" value="_s-xclick" />
                            <input type="hidden" name="hosted_button_id" value="S5YZ4S2UYHPXS" />
                            <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
                            <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
                        </form>
                    </div>
                </div>
            </div>
        );
    }
};

module.exports = Feedback;
