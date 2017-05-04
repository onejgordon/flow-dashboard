var React = require('react');
import {Link} from 'react-router';
import {Line, Bar, Doughnut} from "react-chartjs-2";
import connectToStores from 'alt-utils/lib/connectToStores';
var api = require('utils/api');
var util = require('utils/util');
import {Paper} from 'material-ui';
import {changeHandler} from 'utils/component-utils';
var moment = require('moment')
var Select = require('react-select');
import {merge} from 'lodash';

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
                metric: 'happiness',
                drilldown: null
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
        this.DIMENSIONS = ['place', 'activity'];
        this.METRICS = [
            {value: 'happiness', color: '#A0FE36'},
            {value: 'stress', color: '#F5495E'}
        ];
        this.DEF_OPTS = {
            maintainAspectRatio: false
        }
        this.CHART_HEIGHT = 300;
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


    generate_averages_dataset(snapshots, dim) {
        let {form} = this.state;
        let sb = form.segment_by;
        if (dim == null) dim = sb;
        let dimension_metric_aves = {};
        this.METRICS.forEach((m) => {
            dimension_metric_aves[m.value] = {};
        })
        snapshots.forEach((s) => {
            this.METRICS.forEach((m) => {
                let sdim = s[dim];
                if (!dimension_metric_aves[m.value][sdim]) dimension_metric_aves[m.value][sdim] = [];
                dimension_metric_aves[m.value][sdim].push(s.metrics[m.value]);
            });
        });
        let datasets = [];
        let bars = [];
        let sort_metric = this.METRICS[0].value; // By convention, sorty by first
        let dims = Object.keys(dimension_metric_aves[sort_metric]);
        dims.forEach((dim) => {
            let bar = {
                _label: dim
            };
            this.METRICS.forEach((m) => {
                let arr = dimension_metric_aves[m.value][dim];
                let ave = util.average(arr).toFixed(2);
                bar[m.value] = ave;
            });
            bars.push(bar);
        })
        bars = bars.sort((a, b) => {
            return a[sort_metric] - b[sort_metric];
        });
        this.METRICS.forEach((m) => {
            datasets.push({
                data: bars.map((b) => { return b[m.value] }),
                label: util.capitalize(m.value),
                backgroundColor: m.color
            })
        })
        let data = {
            labels: bars.map((b) => { return b._label }),
            datasets: datasets
        };
        return data;
    }

    get_data() {
        let {form, dimensions, snapshots} = this.state;
        let {segment_by} = form;
        let segment_var = dimensions[segment_by];
        if (segment_var) {
            let pie_data = {
                labels: [],
                datasets: [
                    {
                        data: [],
                        backgroundColor: []
                    }
                ]
            };
            let averages_data = this.generate_averages_dataset(snapshots);
            let datasets = segment_var.map((sv) => {
                let sv_data = this.generate_dataset(sv);
                let color = util.stringToColor(sv);
                pie_data.labels.push(sv);
                pie_data.datasets[0].data.push(sv_data.length);
                pie_data.datasets[0].backgroundColor.push(color);
                return {
                    label: sv,
                    data: sv_data,
                    backgroundColor: color
                };
            });
            return {
                scatter: {
                    datasets: datasets
                },
                pie: pie_data,
                averages: averages_data
            };
        }
    }

    get_drilldown_data(drilldown) {
        let {form, snapshots} = this.state;
        let sb = form.segment_by;
        snapshots = snapshots.filter((s) => {
            return s[sb] == drilldown;
        })
        let dim = sb == this.DIMENSIONS[0] ? this.DIMENSIONS[1] : this.DIMENSIONS[0];
        return this.generate_averages_dataset(snapshots, dim);
    }

    render() {
        let {user} = this.props;
        let {snapshots, form, dimensions} = this.state;
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
                }],
                yAxes: [{
                    ticks: {
                        max: 10,
                        min: 0,
                        stepSize: 1
                    }
                }]
            },
            showLines: false,
            maintainAspectRatio: false
        };
        let avgs_opts = {
            scales: {
                yAxes: [{
                    ticks: {
                        max: 10,
                        min: 0,
                        stepSize: 1
                    }
                }]
            },
            showLines: false,
            maintainAspectRatio: false
        };
        let _drilldown;
        let drilldown_opts = dimensions[form.segment_by].map((op) => {
            return {value: op, label: op};
        }) || [];
        if (form.drilldown) {
            let drilldown_data = this.get_drilldown_data(form.drilldown);
            let opts = {
                scales: {
                    yAxes: [{
                        ticks: {
                            max: 10,
                            min: 0,
                            stepSize: 1
                        }
                    }]
                }
            }
            _drilldown = (
                <div>
                    <Bar data={drilldown_data} options={merge(opts, this.DEF_OPTS)} height={this.CHART_HEIGHT} />
                </div>
            )
        }
        let seg_name = util.capitalize(form.segment_by);
        let content;
        if (user.level == 2) {
            content = (
                <div>
                    <Paper style={{padding: 10, marginBottom: 20, marginTop: 20}}>
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
                    </Paper>

                    <div>
                        <Line data={data.scatter} options={opts} height={this.CHART_HEIGHT}/>
                    </div>

                    <div className="row">
                        <div className="col-sm-6">
                            <h4>Averages by { seg_name }</h4>
                            <div style={{height: "400px"}}>
                                <Bar data={data.averages} options={avgs_opts} height={this.CHART_HEIGHT} />
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <h4>Frequency by { seg_name }</h4>
                            <div style={{height: "400px"}}>
                                <Doughnut data={data.pie} options={this.DEF_OPTS} height={this.CHART_HEIGHT} />
                            </div>
                        </div>
                    </div>

                    <br/><br/>
                    <div className="row">
                        <p>Showing data from <b>{snapshots.length}</b> snapshots.</p>
                    </div>

                    <h4>{ seg_name } Filter</h4>

                    <div className="row">
                        <div className="col-sm-6">
                            <Select onChange={this.changeHandlerVal.bind(this, 'form', 'drilldown')} value={form.drilldown} options={drilldown_opts} simpleValue />
                        </div>
                    </div>

                    { _drilldown }
                </div>
            )
        } else {
            content = (
                <div className="empty">
                    <h3>Snapshots are still in beta!</h3>
                    <small>Snapshots are a short questionnaire collected at random times throughout the day via your smartphone. Want to be a tester? <Link to="/app/feedback">Send a message</Link>.</small>
                </div>
            );
        }
        return (
            <div>

                <h4>Snapshots</h4>

                { content }

            </div>
        );
    }
}

module.exports = AnalysisSnapshot;