var React = require('react');
var util = require('utils/util');

export default class Privacy extends React.Component {
    static defaultProps = {}
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        util.set_title("Privacy Policy");
    }

    render() {
        return (
            <div>

                <h2>Flow Dashboard Privacy Policy</h2>

                <h4>What information does Flow collect?</h4>

                <p>The Flow Dashboard application collects explicitly volunteered user data in order to help users track goals, habits, daily tasks, and events. Flow Dashboard uses Google Cloud Platform to host all data, and retains a log of HTTP request activity for up to 60 days. Conversations hosted by Actions on the Google API are not specifically recorded, though some actions cause updates to user data in the Flow Dashboard app. To authenticate sign in, Flow Dashboard stores the email address of all users.</p>

                <h4>How does Flow use the information?</h4>

                <p>All information is collected for the purpose of providing the Flow Dashboard app services to users. Data stored for each user is owned by that user. Data can be fully cleared by request at any time, and exports can also be made available. Email addresses will never be used for anything other than opt-in notifications.</p>

                <h4>What information does Flow share?</h4>

                <p>No information is shared with third parties.</p>

                <h4>Contact</h4>

                <p>
                    onejgordon@gmail.com<br />
                    Web: https://flowdash.co
                </p>

            </div>
        );
    }
}
