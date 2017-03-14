var React = require('react');
import {Link} from 'react-router';
var util = require('utils/util');

var AppConstants = require('constants/AppConstants');
import {FontIcon, IconButton, FlatButton} from 'material-ui';
var api = require('utils/api');
var ReactLifeTimeline = require('react-life-timeline');
import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
export default class Timeline extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    static getStores() {
        return [];
    }

    static getPropsFromStores() {
        return {};
    }

    componentDidMount() {
    }

    fetch_events(cb) {
      api.get("/api/event", {}, (res) => {
        cb(res.events);
      });
    }

    render() {
        let {loaded} = this.state;
        let DOB = this.props.user.birthday;
        if (!DOB) return <div className="empty">Set your birthday and add events on the <Link to="/app/manage">manage</Link> page.</div>;
        return (
            <div>

                <h2>Timeline</h2>

                <h4>Weeks</h4>

                <ReactLifeTimeline get_events={this.fetch_events.bind(this)} birthday={new Date(DOB)} />

            </div>
        );
    }
};

module.exports = Timeline;
