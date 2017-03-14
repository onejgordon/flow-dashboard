var React = require('react');
import {RaisedButton} from 'material-ui';

export default class About extends React.Component {
    static defaultProps = {}
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        let {user} = this.props;
        let _feedback;
        if (user) _feedback = (
            <div>
                <h3>Thanks for Using Flow</h3>

                <p>Have feedback? Get in touch via Github, or email <a href="mailto:onejgordon@gmail.com">onejgordon@gmail.com</a>.</p>
            </div>
            )
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

                        <p className="lead" style={{fontSize: "1.5em"}}>Everything you put into Flow can be visualized, including your daily journal questions, task completion, habit consistency, etc.</p>

                        <img src="/images/screenshots/analysis.png" className="img-responsive" />

                        <h3>Flow is Open Source</h3>

                        <p className="lead" style={{fontSize: "1.5em"}}>Spin up your own instance, or contribute.</p>

                        <a href="https://github.com/onejgordon/flow-dashboard" target="_blank"><RaisedButton label="Source on Github" /></a>

                        { _feedback }

                    </div>
                </div>

            </div>
        );
    }
}
