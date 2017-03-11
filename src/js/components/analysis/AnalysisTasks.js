var React = require('react');

var util = require('utils/util');

var LoadStatus = require('components/common/LoadStatus');
import {FontIcon, IconButton, FlatButton, AutoComplete,
    Checkbox} from 'material-ui';
import {Bar, Line} from "react-chartjs-2";
var api = require('utils/api');
import {get} from 'lodash';

import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
export default class AnalysisTasks extends React.Component {
    static defaultProps = {
        goals: {}
    };
    constructor(props) {
        super(props);
        let today = new Date();
        let start = new Date();
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

    task_data() {
        let {iso_dates, tasks} = this.props;
        let datasets = [];
        let completed_on_time = [];
        let completed_late = [];
        let not_completed = [];
        let DUE_BUFFER = 1000*60*60*2; // 2 hrs
        iso_dates.forEach((iso_date) => {
            let tasks_due_on_day = tasks.filter((t) => {
                return util.printDate(t.ts_due) == iso_date;
            });
            let n_on_time = 0;
            let n_late = 0;
            let n_incomplete = 0;
            tasks_due_on_day.forEach((t) => {
                let done = t.done;
                if (done) {
                    let on_time = t.ts_done <= t.ts_due + DUE_BUFFER;
                    if (on_time) n_on_time += 1;
                    else n_late += 1;
                } else {
                    n_incomplete += 1;
                }
            });
            completed_on_time.push(n_on_time);
            completed_late.push(n_late);
            not_completed.push(n_incomplete);
        })
        let data = {
            labels: iso_dates,
            datasets: [
                {
                    label: "Completed",
                    data: completed_on_time,
                    backgroundColor: '#4FFF7A'
                },
                {
                    label: "Completed Late",
                    data: completed_late,
                    backgroundColor: '#DBFE5E'
                },
                {
                    label: "Not Completed",
                    data: not_completed,
                    backgroundColor: '#F7782D'
                }
            ]
        };
        return data;
    }

    render() {
        let today = new Date();
        let taskData = this.task_data()
        let taskOptions = {
            scales: {
                yAxes: [{
                    stacked: true
                }],
                xAxes: [{
                    stacked: true
                }]
            }
        }
        return (
            <div>

                <h4>Tasks</h4>

                <Bar data={taskData} options={taskOptions} width={1000} height={450}/>

            </div>
        );
    }
};

module.exports = AnalysisTasks;