var React = require('react');
var util = require('utils/util');
import {Bar, Line} from "react-chartjs-2";
var Select = require('react-select');
import {changeHandler} from 'utils/component-utils';
import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
@changeHandler
export default class AnalysisTasks extends React.Component {
    static defaultProps = {
        goals: {}
    };
    constructor(props) {
        super(props);
        this.state = {
            form: {
                chart_type: 'count'  // ['count', 'sessions', 'time']
            },
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

    get_task_value(t) {
        let {form} = this.state;
        return {
            'count': 1,
            'sessions': t.timer_complete_sess,
            'time': parseInt(t.timer_total_ms / 1000 / 60)
        }[form.chart_type];
    }

    task_data() {

        let {iso_dates, tasks} = this.props;
        let completed_on_time = [];
        let completed_late = [];
        let not_completed = [];
        let DUE_BUFFER = 1000*60*60*2; // 2 hrs
        iso_dates.forEach((iso_date) => {
            let tasks_due_on_day = tasks.filter((t) => {
                return util.printDate(t.ts_due) == iso_date;
            });
            let on_time_value = 0;
            let late_value = 0;
            let incomplete_value = 0;
            tasks_due_on_day.forEach((t) => {
                let done = t.done;
                let value = this.get_task_value(t);
                if (done) {
                    let on_time = t.ts_done <= t.ts_due + DUE_BUFFER;
                    if (on_time) on_time_value += value;
                    else late_value += value;
                } else {
                    incomplete_value += value;
                }
            });
            completed_on_time.push(on_time_value);
            completed_late.push(late_value);
            not_completed.push(incomplete_value);
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
        let {form} = this.state;
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
        let opts = [
            {value: 'count', label: "Task Count"},
            {value: 'sessions', label: "Completed Sessions"},
            {value: 'time', label: "Logged Time (minutes)"}
        ]
        return (
            <div>

                <h4>Top Tasks</h4>

                <div className="vpad">
                    <div className="row">
                        <div className="col-sm-6 col-sm-offset-6">
                            <label>Bar Height</label>
                            <Select options={opts} value={form.chart_type} onChange={this.changeHandlerVal.bind(this, 'form', 'chart_type')} simpleValue clearable={false} />
                        </div>
                    </div>
                </div>

                <Bar data={taskData} options={taskOptions} width={1000} height={450}/>

            </div>
        );
    }
}

module.exports = AnalysisTasks;