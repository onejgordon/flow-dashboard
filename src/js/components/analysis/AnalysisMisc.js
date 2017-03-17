var React = require('react');

import {Bar} from "react-chartjs-2";
import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
export default class AnalysisMisc extends React.Component {
    static defaultProps = {
        habitdays: {},
        habits: [],
        tracking_days: []
    };
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

    habit_day_checked(iso_date, habit) {
        let {habitdays} = this.props;
        let id = `habit:${habit.id}_day:${iso_date}`;
        if (habitdays[id]) return habitdays[id].done;
        return false;
    }

    habit_data() {
        let {iso_dates, habitdays, habits} = this.props;
        let datasets = [];
        habits.forEach((h) => {
            let data = iso_dates.map((iso_date) => {
                return this.habit_day_checked(iso_date, h) ? 1 : 0;
            });
            let dataset = {
                label: h.name,
                data: data,
                backgroundColor: h.color || "#FFFFFF"
            };
            datasets.push(dataset);
        })
        let data = {
            labels: iso_dates,
            datasets: datasets
        };
        return data;
    }

    productivity_data() {
        let {tracking_days} = this.props;
        let labels = [];
        let data = [];
        tracking_days.forEach((td) => {
            data.push(td.data.commits);
            labels.push(new Date(td.iso_date));
        });
        let pdata = {
            labels: labels,
            datasets: [
                {
                    label: "Commits",
                    data: data,
                    backgroundColor: '#44ff44'
                }
            ]
        };
        return pdata;
    }

    render() {
        let {loaded, tracking_days, habits} = this.props;
        let today = new Date();
        let habitData = this.habit_data()
        let habitOptions = {
            scales: {
                yAxes: [{
                    stacked: true
                }],
                xAxes: [{
                    stacked: true
                }]
            }
        }
        let trackingData = this.productivity_data();
        let trackingOps = {
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                }],
                yAxes: [{
                    ticks: {
                        min: 0,
                        stepSize: 1
                    }
                }],
            }
        };
        if (!loaded) return null;

        return (
            <div>

                <h4>Habits</h4>

                <Bar data={habitData} options={habitOptions} width={1000} height={450}/>

                <h4>Productivity</h4>

                <Bar data={trackingData} options={trackingOps} width={1000} height={450}/>

            </div>
        );
    }
};

module.exports = AnalysisMisc;