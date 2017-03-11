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
export default class Analysis extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
        let today = new Date();
        let start = new Date();
        this.INITIAL_RANGE = 14;
        let user = props.user;
        let questions = [];
        if (user) questions = get(user, 'settings.journals.questions', []);
        let chart_enabled = questions.filter((q) => {
            return q.chart_default;
        }).map((q) => {return q.name;});
        start.setDate(today.getDate() - this.INITIAL_RANGE);
        this.state = {
            start: start,
            end: today,
            iso_dates: [],
            journals: [],
            goals: {},
            habits: [],
            tasks: [],
            productivity: [],
            habitdays: {},
            tags: [],
            loaded: false,
            tags_loading: false,
            journal_tag_segment: null,
            journal_segments: {}, // tag.id -> { data: [], labels: [] }
            questions: questions,
            chart_enabled_questions: chart_enabled
        };
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

    toggle_series(series) {
        let {chart_enabled_questions} = this.state;
        util.toggleInList(chart_enabled_questions, series);
        this.setState({chart_enabled_questions});
    }

    render_journal_series_selection() {
        let {chart_enabled_questions, questions} = this.state;
        let all_selectable_series = questions.filter((q) => {
            return q.chart;
        });
        return all_selectable_series.map((q) => {
            let checked = chart_enabled_questions.indexOf(q.name) > -1;
            return <Checkbox name={q.name} label={q.label} checked={checked} onCheck={this.toggle_series.bind(this, q.name)} />
        });
    }

    fetch_data() {
        let {start, end} = this.state;
        let params = {
            date_start: util.printDateObj(start, 'UTC'),
            date_end: util.printDateObj(end, 'UTC'),
            with_productivity: 1
        }
        api.get("/api/analysis", params, (res) => {
            console.log(res);
            this.setState({journals: res.journals,
                iso_dates: res.dates,
                habits: res.habits,
                tasks: res.tasks,
                productivity: res.productivity,
                habitdays: res.habitdays,
                goals: util.lookupDict(res.goals, 'month'),
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

    journal_data() {
        let {journals, chart_enabled_questions, questions} = this.state;
        let labels = [];
        let ratings = [];
        let predictions = [];
        let chart_questions = questions.filter((q) => {
            return q.chart && chart_enabled_questions.indexOf(q.name) > -1;
        });
        let data = {}
        journals.forEach((jrnl) => {
            labels.push(new Date(jrnl.iso_date));
            chart_questions.forEach((q) => {
                if (!data[q.name]) data[q.name] = [];
                data[q.name].push(jrnl.data[q.name]);
            });
        });
        let datasets = chart_questions.map((q) => {
            let rgb = util.hexToRgb(q.color);
            return {
                label: q.label,
                data: data[q.name],
                backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
                pointBackgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`
            }
        });
        return {
            labels: labels,
            datasets: datasets
        }
    }

    habit_data() {
        let {iso_dates, habitdays, habits} = this.state;
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

    task_data() {
        let {iso_dates, tasks} = this.state;
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

    goal_data() {
        let {goals} = this.state;
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

    productivity_data() {
        let {productivity} = this.state;
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

    handle_tag_input_update(searchText, dataSource, params) {
        let {tags, tags_loading} = this.state;
        if (tags.length == 0 && !tags_loading) {
            console.log('load')
            this.setState({tags_loading: true}, () => {
                api.get("/api/journaltag", {}, (res) => {
                    console.log(res.tags);
                    this.setState({tags: res.tags, tags_loading: false});
                })
            })
        }
    }

    handle_tag_selected(chosenRequest, index) {
        let {tags, journal_segments, journals, questions} = this.state;
        let tag = tags[index];
        console.log(tag);
        let days_without_tag = [];
        let days_with_tag = [];
        let aggregate = {};
        let variables = questions.filter((q) => {
            return q.tag_segment_chart;
        });
        journals.forEach((j) => {
            let has_tag = j.tags.indexOf(tag.id) > -1;
            variables.forEach((v) => {
                let val = j.data[v.name];
                if (!aggregate[v.name]) aggregate[v.name] = {
                    with: [],
                    without: []
                }
                if (val != null) {
                    if (has_tag) {
                        aggregate[v.name].with.push(val);
                    } else {
                        aggregate[v.name].without.push(val);
                    }
                }
            })
        });

        // Generate segmentation
        let data_with = [];
        let data_without = [];
        // let labels = [];
        variables.forEach((v) => {
            // labels = labels.concat([v + ' (with tag)', v + ' (without tag)']);
            data_with.push(util.average(aggregate[v.name].with));
            data_without.push(util.average(aggregate[v.name].without));
        });
        journal_segments[tag.id] = {
            data_with_tag: data_with,
            data_without_tag: data_without,
            labels: variables.map((v) => { return v.label; })
        }
        console.log(journal_segments);
        this.setState({journal_tag_segment: tag, journal_segments: journal_segments});
    }

    render() {
        let {loaded, journal_tag_segment, journal_segments} = this.state;
        let today = new Date();
        let _journals_segmented;
        let journalData = this.journal_data();
        let journalOptions = {
            scales: {
                yAxes: [{
                    ticks: {
                        max: 10,
                        min: 1,
                        stepSize: 1
                    }
                }],
                xAxes: [{
                    type: 'time',
                    time: {
                        displayFormats: {},
                        unit: 'day'
                    }
                }]
            }
        };
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
        if (!loaded) return null;
        if (journal_tag_segment) {
            let segmented_data = journal_segments[journal_tag_segment.id];
            let segmented_opts = {
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                max: 10,
                                min: 1,
                                stepSize: 1
                            }
                        }
                    ]
                }
            };
            _journals_segmented = (
                <div>
                    <h4>Journals Segmented by {journal_tag_segment.id}</h4>

                    <Bar options={segmented_opts} data={{
                        labels: segmented_data.labels,
                        datasets: [
                            {
                                label: `With ${journal_tag_segment.id}`,
                                data: segmented_data.data_with_tag,
                                backgroundColor: '#F73C7C'
                            },
                            {
                                label: `Without ${journal_tag_segment.id}`,
                                data: segmented_data.data_without_tag,
                                backgroundColor: '#CCC'
                            }
                        ]
                        }} />

                </div>
            );
        }
        return (
            <div>

                <h2>Analysis</h2>

                <h4>Goal Assessments ({today.getFullYear()})</h4>

                <Bar data={goalData} options={goalOptions} width={1000} height={450}/>

                <IconButton iconClassName="material-icons" onClick={this.fetch_data.bind(this)}>refresh</IconButton>

                <h4>Journals</h4>

                <div>
                { this.render_journal_series_selection() }
                </div>

                <Line data={journalData} options={journalOptions} width={1000} height={450}/>

                <AutoComplete
                      hintText="Start typing #tag or @mention..."
                      dataSource={this.state.tags}
                      onUpdateInput={this.handle_tag_input_update.bind(this)}
                      onNewRequest={this.handle_tag_selected.bind(this)}
                      filter={(searchText, key) => searchText !== '' && key.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 }
                      dataSourceConfig={{text: 'id', value: 'id'}}
                      floatingLabelText="Tag Segment"
                      fullWidth={true}
                    />

                { _journals_segmented }

                <h4>Tasks</h4>

                <Bar data={taskData} options={taskOptions} width={1000} height={450}/>

                <h4>Habits</h4>

                <Bar data={habitData} options={habitOptions} width={1000} height={450}/>

                <h4>Productivity</h4>

                <Bar data={productivityData} options={productivityOptions} width={1000} height={450}/>

            </div>
        );
    }
};

module.exports = Analysis;