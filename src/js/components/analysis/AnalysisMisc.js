var React = require('react');

var util = require('utils/util');

var LoadStatus = require('components/common/LoadStatus');
import {FontIcon, IconButton, FlatButton, AutoComplete,
    Checkbox} from 'material-ui';
import {Bar, Line} from "react-chartjs-2";
var api = require('utils/api');
import {get} from 'lodash';
import {Link} from 'react-router';
import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
export default class AnalysisMisc extends React.Component {
    static defaultProps = {
        habitdays: {},
        habits: [],
        productivity: []
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
        let {productivity} = this.props;
        let labels = [];
        let data = [];
        productivity.forEach((p) => {
            data.push(p.data.commits);
            labels.push(new Date(p.iso_date));
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
        let {loaded, productivity, habits} = this.props;
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
        let productivityData = this.productivity_data();
        let productivityOptions = {
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

                <Bar data={productivityData} options={productivityOptions} width={1000} height={450}/>

            </div>
        );
    }
};

module.exports = AnalysisMisc;