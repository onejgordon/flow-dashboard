var React = require('react');

var AppConstants = require('constants/AppConstants');
import {Bar, Line} from "react-chartjs-2";
import connectToStores from 'alt-utils/lib/connectToStores';
var util = require('utils/util');
var api = require('utils/api');


@connectToStores
export default class AnalysisHabits extends React.Component {
    static propTypes = {
        loaded: React.PropTypes.bool,
        days: React.PropTypes.number
    }

    static defaultProps = {
        days: 21
    };
    constructor(props) {
        super(props);
        this.state = {
            habitdays: {},
            habits: [],
        };
        this.ROLLING_WINDOW = 7;
    }

    static getStores() {
        return [];
    }

    static getPropsFromStores() {
        return {};
    }

    have_data() {
        return this.state.habits.length > 0;
    }

    componentDidMount() {
        if (!this.have_data()) this.fetch_data();
    }

    fetch_data() {
        let today = new Date();
        let start = new Date();
        start.setDate(start.getDate() - this.props.days);
        let params = {
            date_start: util.printDateObj(start, 'UTC'),
            date_end: util.printDateObj(today, 'UTC'),
            with_habits: 1
        }
        api.get("/api/analysis", params, (res) => {
            this.setState({
                iso_dates: res.dates,
                habits: res.habits,
                habitdays: res.habitdays,
                loaded: true
            });
        });
    }

    habit_day_checked(iso_date, habit) {
        let {habitdays} = this.state;
        let id = `habit:${habit.id}_day:${iso_date}`;
        if (habitdays[id]) return habitdays[id].done;
        return false;
    }

    habit_data() {
        let {iso_dates, habits} = this.state;
        let datasets = [];
        let day_counts = {}; // iso_date -> # of habits done
        habits.forEach((h) => {
            let data = iso_dates.map((iso_date) => {
                let checked = this.habit_day_checked(iso_date, h) ? 1 : 0;
                if (checked) {
                    if (!day_counts[iso_date]) day_counts[iso_date] = 0;
                    day_counts[iso_date] += 1;
                }
                return checked;
            });
            let dataset = {
                label: h.name,
                data: data,
                backgroundColor: h.color || "#FFFFFF"
            };
            datasets.push(dataset);
        })
        let habit_data = {
            labels: iso_dates,
            datasets: datasets
        };
        return {habit_data, day_counts};
    }

    trend_data(day_counts) {
        let {iso_dates, habits} = this.state;
        let rwindow = [];
        let series_data = [];
        let labels = [];
        iso_dates.forEach((iso_date) => {
            let n_done = day_counts[iso_date] || 0;
            rwindow.push(n_done);
            if (rwindow.length > this.ROLLING_WINDOW) {
                rwindow.splice(0, 1); // Remove first element
            }
            let full_window = rwindow.length == this.ROLLING_WINDOW;
            if (full_window) {
                let {sum} = util.sum(rwindow);
                series_data.push(sum);
                labels.push(iso_date);
            }
        });
        let dataset = {
            label: "Rolling Average",
            data: series_data,
            pointBorderColor: '#444444',
            pointBackgroundColor: `rgba(255, 255, 255, 0.8)`,
            backgroundColor: `rgba(255, 255, 255, 0.6)`
        };
        let total_weekly_target = 0;
        habits.forEach((h) => {
            if (h.tgt_weekly) total_weekly_target += h.tgt_weekly;
        });
        let target_dataset = {
            label: `Total Weekly Target (${total_weekly_target})`,
            data: new Array(series_data.length).fill(total_weekly_target),
            borderColor: `rgba(244, 223, 66, 0.8)`,
            backgroundColor: `rgba(244, 223, 66, 0.1)`
        };
        let trend_data = {
            labels: labels,
            datasets: [dataset, target_dataset]
        };
        return {trend_data, total_weekly_target};
    }

    render() {
        let {loaded} = this.props;
        if (!this.have_data()) return <div className="empty">Loading</div>
        let {habit_data, day_counts} = this.habit_data();
        let {trend_data, total_weekly_target} = this.trend_data(day_counts);
        let habitOptions = {
            scales: {
                yAxes: [{
                    stacked: true
                }],
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    stacked: true
                }]
            }
        }
        let trendOpts = {
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                }],
                yAxes: [{
                    ticks: {
                        suggestedMax: total_weekly_target + 3,
                        min: 0
                    }
                }],
            }
        }
        if (!loaded) return null;
        return (
            <div>

                <h4>Habits</h4>

                <Bar data={habit_data} options={habitOptions} width={1000} height={450}/>

                <h5>Overall Trend</h5>
                <p className="lead">Completions per week (rolling 7 day average)</p>

                <Line data={trend_data} options={trendOpts} width={1000} height={450}/>

            </div>
        );
    }
};

module.exports = AnalysisHabits;