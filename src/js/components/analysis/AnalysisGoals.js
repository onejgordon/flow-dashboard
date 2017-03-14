var React = require('react');
import {Bar} from "react-chartjs-2";
import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
export default class AnalysisGoals extends React.Component {
    static defaultProps = {
        goals: {}
    };
    constructor(props) {
        super(props);
        let today = new Date();
        let start = new Date();
        let questions = [];
        start.setDate(today.getDate() - this.INITIAL_RANGE);
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

    render() {
        let {goals} = this.props;
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
            }
        }
        if (Object.keys(goals).length == 0) return null;
        return (
            <div>

                <h4>Goal Assessments ({today.getFullYear()})</h4>

                <Bar data={goalData} options={goalOptions} width={1000} height={450}/>

            </div>
        );
    }
};

module.exports = AnalysisGoals;