var React = require('react');
import PropTypes from 'prop-types';
import {Bar} from "react-chartjs-2";
import {Dialog, IconButton} from 'material-ui';
import Select from 'react-select'
import connectToStores from 'alt-utils/lib/connectToStores';
var ProgressLine = require('components/common/ProgressLine');
var util = require('utils/util');
var api = require('utils/api');
import {changeHandler} from 'utils/component-utils';

@changeHandler
export default class AnalysisGoals extends React.Component {
    static propTypes = {
        goals: PropTypes.object // id -> goal
    }

    static defaultProps = {
        goals: {}
    }

    constructor(props) {
        super(props);
        let today = new Date();
        this.state = {
            goal_detail: null,
            goal_year: today.getFullYear(),
            form: {
                year: today.getFullYear()
            }
        };

        this.FIRST_GOAL_YEAR = 2016;
    }

    componentDidMount() {

    }

    dismiss() {
        this.setState({goal_detail: null});
    }

    goal_data() {
        let {goals} = this.props;
        let {goal_year} = this.state
        let points = []
        let periods = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", goal_year];
        let colors = []
        let month_values = []
        periods.forEach((mo, i) => {
            let id = util.goal_id(goal_year, i <= 11 ? i+1 : null)
            let g = goals[id]
            let val = null;
            if (g) {
                val = g.assessment.toFixed(2);
                if (!g.annual) month_values.push(val)
            }
            points.push(val)
            let bgcolor = '#' + util.colorInterpolate({
                color1: '95000C',
                color2: '00EB0F',
                min: 1,
                max: 5,
                value: val || 1
            })
            colors.push(bgcolor)
        })
        let datasets = [
            {
                label: "Goal Assessment",
                data: points,
                backgroundColor: colors
            }
        ]
        let monthly_avg = util.average(month_values)
        if (month_values.length > 0) {
            datasets.push({
                label: "Monthly Assessment Average",
                type: 'line',
                data: Array(13).fill(monthly_avg),
                borderColor: `rgba(255, 255, 255, 0.8)`,
                backgroundColor: `rgba(255, 255, 255, 0.1)`
            })
        }
        let data = {
            labels: periods,
            datasets: datasets
        }
        return data;
    }

    handle_chart_click(event, els) {
        let {goals} = this.props
        let {goal_year} = this.state
        let el = els[0]
        if (el != null) {
            let idx = els[0]._index
            if (idx) {
                let g = goals[util.goal_id(goal_year, idx <= 11 ? idx+1 : null)]
                if (g) this.setState({goal_detail: g})
            }
        }
    }

    render_goal_details() {
        let {goal_detail} = this.state;
        if (!goal_detail) return <div></div>
        return <ul className="goalList">{ goal_detail.text.map((text, i) => {
            let assess;
            let assess_num = 0;
            if (goal_detail.assessments) assess_num = goal_detail.assessments[i]
            if (assess_num) assess = <ProgressLine
                                            value={assess_num}
                                            total={5}
                                            tooltip={`Assessment: ${assess_num}`}
                                            min_color="#FC004E" />
            return (
                <div key={i}>
                    <li>{text}</li>
                    { assess }
                </div>
            )
        }) }</ul>
    }

    fetch_goal_year() {
        let {form} = this.state
        let year = form.year
        let params = {
            year: year,
            include_annual: 1
        }
        api.get("/api/goal", params, (res) => {
            this.props.onUpdateData('goals', util.lookupDict(res.goals, 'id'))
            this.setState({goal_year: year})
        });
    }

    render() {
        let {goals} = this.props;
        let {goal_detail, form, goal_year} = this.state;
        let today = new Date();
        let goalData = this.goal_data();
        let goalOptions = {
            scales: {
                yAxes: [{
                    ticks: {
                        min: 1,
                        max: 5,
                        stepSize: 1
                    }
                }]
            },
            onClick: this.handle_chart_click.bind(this)
        }
        let content;
        if (Object.keys(goals).length == 0) content = <div className="empty">No goal assessments yet</div>
        else content = <Bar data={goalData} options={goalOptions} width={1000} height={450}/>
        let year_cursor = this.FIRST_GOAL_YEAR;
        let year_opts = []
        while (year_cursor <= today.getFullYear()) {
            year_opts.push({value: year_cursor, label: year_cursor})
            year_cursor += 1;
        }
        return (
            <div>

                <h4>Goal Assessments ({goal_year})</h4>

                <div className="row">
                    <div className="col-sm-3 col-sm-offset-9">
                        <label>Year</label>
                        <Select options={year_opts} value={form.year} onChange={this.changeHandlerVal.bind(this, 'form', 'year')} simpleValue clearable={false} />
                        <IconButton iconClassName="material-icons" onClick={this.fetch_goal_year.bind(this)}>refresh</IconButton>
                    </div>
                </div>

                <p className="lead">Goal assessments (self-assessments of performance towards stated goals on a 1-5 scale) are submitted at the end of each month, from the goals widget on the dashboard.</p>

                { content }

                <Dialog open={goal_detail != null} title={goal_detail ? `Goals for ${goal_detail.id}` : ""} onRequestClose={this.dismiss.bind(this)}>
                    { this.render_goal_details() }
                </Dialog>

            </div>
        );
    }
}

module.exports = AnalysisGoals;