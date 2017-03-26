var React = require('react');
import {RaisedButton} from 'material-ui';
var AppConstants = require('constants/AppConstants');

export default class About extends React.Component {
    static defaultProps = {}
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        util.set_title("About");
    }

    render() {
        let {user} = this.props;
        let _feedback;
        if (user) _feedback = (
            <div>
                <h3>Thanks for Using Flow</h3>

                <p>Have feedback? Get in touch via Github, or email onejgordon (gmail).</p>
            </div>
            )
        return (
            <div>

                <div className="text-center">

                    <h2 style={{marginTop: "40px", marginBottom: "60px"}}>About</h2>

                    <p className="lead" style={{fontSize: "1.45em"}}>{ AppConstants.TAGLINE }</p>

                    <div className="row">

                        <h3>The Flow Dashboard</h3>

                        <p className="lead" style={{fontSize: "1.45em"}}>Track habits, monthly and annual goals, and the top tasks of the day. Submit daily journals with customizable questions.</p>

                        <img src="/images/screenshots/dashboard.png" className="img-responsive" />

                        <h3>Visualize everything.</h3>

                        <p className="lead" style={{fontSize: "1.45em"}}>Everything you put into Flow can be visualized, including your daily journal questions, task completion...</p>

                        <img src="/images/screenshots/analysis.png" className="img-responsive" />

                        <p className="lead" style={{fontSize: "1.45em"}}>...performance on individual habits, and more.</p>

                        <img src="/images/screenshots/habit.png" className="img-responsive" />

                        <h3>Your timeline.</h3>

                        <p className="lead" style={{fontSize: "1.45em"}}>A birds-eye-view of your life by weeks.</p>

                        <img src="/images/screenshots/timeline.png" className="img-responsive" />


                        <h3>Chat with Flow</h3>

                        <div className="center-block">
                            <img src="/images/messenger_512.png" width="200" />
                        </div>

                        <p className="lead" style={{fontSize: "1.45em"}}>You can chat with <a href="https://www.facebook.com/FlowDashboard/" target="_blank">Flow on Facebook Messenger</a> to review goals, commit to and complete tasks and habits, and answer your daily journal questions.</p>

                        <h3>Flow is Open Source</h3>

                        <p className="lead" style={{fontSize: "1.45em"}}>Spin up your own instance, or contribute.</p>

                        <a href="https://github.com/onejgordon/flow-dashboard" target="_blank"><RaisedButton label="Source on Github" /></a>

                        { _feedback }

                    </div>
                </div>

            </div>
        );
    }
}
