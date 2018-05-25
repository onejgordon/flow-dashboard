var React = require('react');

var util = require('utils/util');
import {IconButton, FlatButton} from 'material-ui';
var api = require('utils/api');
import {get} from 'lodash';
import {Link} from 'react-router';
import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
export default class Analysis extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
        let today = new Date();
        let start = new Date();
        let end = new Date();
        this.INITIAL_RANGE = 14;
        let user = props.user;
        let questions = [];
        if (user) questions = get(user, 'settings.journals.questions', []);
        let chart_enabled = questions.filter((q) => {
            return q.chart_default;
        }).map((q) => {return q.name;});
        start.setDate(today.getDate() - this.INITIAL_RANGE);
        end.setDate(today.getDate() + 1); // Include all of today
        this.state = {
            start: start,
            end: end,
            iso_dates: [],
            journals: [],
            goals: {},
            habits: [],
            tasks: [],
            productivity: [],
            habitdays: {},
            tags: [],
            loaded: false,
            tags_loading: false,
            questions: questions,
            chart_enabled_questions: chart_enabled
        };

        this.handle_update = this.handle_update.bind(this)
    }

    static getStores() {
        return [];
    }

    static getPropsFromStores() {
        return {};
    }

    componentDidMount() {
        util.set_title("Analysis");
        this.fetch_data();
    }

    fetch_data() {
        let {start, end} = this.state;
        let params = {
            date_start: util.printDateObj(start, 'UTC'),
            date_end: util.printDateObj(end, 'UTC'),
            with_tracking: 1,
            with_goals: 1,
            with_tasks: 1
        }
        api.get("/api/analysis", params, (res) => {
            this.setState({
                journals: res.journals,
                iso_dates: res.dates,
                tasks: res.tasks,
                habits: res.habits,
                tracking_days: res.tracking_days,
                goals: util.lookupDict(res.goals, 'month'),
                loaded: true
            });
        });
    }

    handle_update(key, data) {
        let state = this.state
        state[key] = data
        this.setState(state)
    }

    render() {
        let {loaded, goals,
            habits, habitdays, iso_dates,
            tracking_days,
            journals, tasks, end} = this.state;
        if (!loaded) return null;
        return (
            <div>

                <h2>Analysis</h2>

                <IconButton iconClassName="material-icons" onClick={this.fetch_data.bind(this)}>refresh</IconButton>

                <Link to="/app/analysis/goals"><FlatButton label="Goals" /></Link>
                <Link to="/app/analysis/journals"><FlatButton label="Journals" /></Link>
                <Link to="/app/analysis/tasks"><FlatButton label="Tasks" /></Link>
                <Link to="/app/analysis/habits"><FlatButton label="Habits" /></Link>
                <Link to="/app/analysis/misc"><FlatButton label="Tracking" /></Link>
                <Link to="/app/analysis/snapshots"><FlatButton label="Snapshots" /></Link>

                <div><small>Note that on all charts clicking on series labels will toggle visibility</small></div>

                { React.cloneElement(this.props.children, {
                    user: this.props.user,
                    goals: goals,
                    journals: journals,
                    tasks: tasks,
                    tracking_days: tracking_days,
                    habits: habits,
                    habitdays: habitdays,
                    iso_dates: iso_dates,
                    end_date: end,
                    loaded: loaded,
                    onUpdateData: this.handle_update }) }

            </div>
        );
    }
}

module.exports = Analysis;