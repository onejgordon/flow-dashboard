var React = require('react');

import {Line} from "react-chartjs-2";
import connectToStores from 'alt-utils/lib/connectToStores';
var api = require('utils/api');
var util = require('utils/util');
import {changeHandler} from 'utils/component-utils';
var moment = require('moment')
var Select = require('react-select');

@connectToStores
@changeHandler
export default class AnalysisSnapshot extends React.Component {
    static defaultProps = {
    };
    constructor(props) {
        super(props);
        this.state = {
            snapshots: [],
            dimensions: {},
            form: {
                segment_by: 'activity',
                x_axis: 'minute_of_day',
                metric: 'happiness'
            }
        };
        this.segment_opts = [
            {value: 'activity', label: "Activity"},
            {value: 'place', label: "Place"},
        ];
        this.x_axis_opts = [
            {value: 'minute_of_day', label: "Time of Day"},
            {value: 'hour_of_week', label: "Week"},
        ];
        this.metric_opts = [
            {value: 'happiness', label: "Happiness"},
            {value: 'stress', label: "Stress"},
        ];
    }

    static getStores() {
        return [];
    }

    static getPropsFromStores() {
        return {};
    }

    componentDidMount() {
        this.fetch_data();
    }

    fetch_data() {
        api.get("/api/snapshot", {}, (res) => {
            let dimensions = {place: [], activity: []};
            res.snapshots.forEach((s) => {
                Object.keys(dimensions).forEach((dk) => {
                    if (s[dk] && dimensions[dk].indexOf(s[dk]) == -1) dimensions[dk].push(s[dk]);
                })
            });
            console.log(dimensions);
            this.setState({snapshots: res.snapshots, dimensions: dimensions});
        })
    }

    get_x_coord(snapshot) {
        let {form} = this.state;
        let date = new Date(snapshot.ts);
        if (form.x_axis == 'minute_of_day') {
            return moment().minute(date.getMinutes()).hour(date.getHours());
            // return date.getHours() * 60 + date.getMinutes(); // 0 - 24*60
        } else if (form.x_axis == 'hour_of_week') {
            // return  * 24 + date.getHours(); // 0 - 24*7
            return moment().day(date.getDay()).hour(date.getHours());
        }
    }

    generate_dataset(sv) {
        let {snapshots, form} = this.state;
        let {segment_by, metric} = form;
        let filtered_snapshots = snapshots.filter((s) => {
            return s[segment_by] == sv;
        });
        return filtered_snapshots.map((s) => {
            let y = s.metrics[metric] || 0;
            let x = this.get_x_coord(s);
            return {
                x: x,
                y: y
            }
        });
    }

    get_data() {
        let {user} = this.props;
        let {form, dimensions} = this.state;
        let {segment_by} = form;
        let segment_var = dimensions[segment_by];
        if (segment_var) {
            let datasets = segment_var.map((sv) => {
                return {
                    label: sv,
                    data: this.generate_dataset(sv),
                    backgroundColor: util.stringToColor(sv)
                };
            });
            let data = {
                datasets: datasets
            };
            return data;
        }
    }

    render() {
        let {snapshots, form} = this.state;
        let data = this.get_data();
        if (data == null) return <div></div>
        let displayFormats = {
            'minute_of_day': {hour: 'kk:mm'},
            'hour_of_week': {day: 'ddd'}
        }[form.x_axis];
        let unit = {
            'minute_of_day': 'hour',
            'hour_of_week': 'day',
        }[form.x_axis];
        let tooltipFormat = {
            'minute_of_day': 'kk:mm',
            'hour_of_week': 'ddd kk:mm',
        }[form.x_axis];
        let opts = {
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        displayFormats: displayFormats,
                        tooltipFormat: tooltipFormat,
                        unit: unit
                    },
                    position: 'bottom'
                }]
            },
            showLines: false
        };
        return (
            <div>

                <h4>Snapshots</h4>

                <div className="row">
                    <div className="col-sm-4">
                        <Select onChange={this.changeHandlerVal.bind(this, 'form', 'segment_by')} value={form.segment_by} options={this.segment_opts} simpleValue />
                    </div>
                    <div className="col-sm-4">
                        <Select onChange={this.changeHandlerVal.bind(this, 'form', 'x_axis')} value={form.x_axis} options={this.x_axis_opts} simpleValue />
                    </div>
                    <div className="col-sm-4">
                        <Select onChange={this.changeHandlerVal.bind(this, 'form', 'metric')} value={form.metric} options={this.metric_opts} simpleValue />
                    </div>
                </div>

                <Line data={data} options={opts} width={1000} height={450}/>

                <p>Showing data from <b>{snapshots.length}</b> snapshots.</p>

            </div>
        );
    }
}

module.exports = AnalysisSnapshot;