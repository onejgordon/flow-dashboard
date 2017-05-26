var React = require('react');
import {Bar} from "react-chartjs-2";
import {Dialog} from 'material-ui';
import connectToStores from 'alt-utils/lib/connectToStores';
var ProgressLine = require('components/common/ProgressLine');

@connectToStores
export default class AnalysisGoals extends React.Component {
    static propTypes = {
        goals: React.PropTypes.object
    }

    static defaultProps = {
        goals: {}
    };
    constructor(props) {
        super(props);
        let today = new Date();
        let start = new Date();
        start.setDate(today.getDate() - this.INITIAL_RANGE);
        this.state = {
            goal_detail: null
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

    dismiss() {
        this.setState({goal_detail: null});
    }

    goal_data() {
        let {goals} = this.props;
        let points = [];
        let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        months.forEach((mo, i) => {
            let g = goals[i+1];
            let val = null;
            if (g) val = g.assessment;
            points.push(val);
        })
        let data = {
            labels: months,
            datasets: [{
                label: "Goal Assessment",
                data: points,
                backgroundColor: '#F67C5F'
            }]
        };
        return data;
    }

    handle_chart_click(event, els) {
        let {goals} = this.props;
        let idx = els[0]._index;
        if (idx) {
            let g = goals[idx+1];
            if (g) this.setState({goal_detail: g});
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

    render() {
        let {goals} = this.props;
        let {goal_detail} = this.state;
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
        return (
            <div>

                <h4>Goal Assessments ({today.getFullYear()})</h4>

                <p className="lead">Goal assessments (self-assessments of performance towards stated goals on a 1-5 scale) are submitted at the end of each month, from the goals widget on the dashboard.</p>

                { content }

                <Dialog open={goal_detail != null} title={goal_detail ? `Goals for ${goal_detail.id}` : ""} onRequestClose={this.dismiss.bind(this)}>
                    { this.render_goal_details() }
                </Dialog>

            </div>
        );
    }
};

module.exports = AnalysisGoals;