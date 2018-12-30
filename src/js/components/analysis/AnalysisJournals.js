var React = require('react');
var util = require('utils/util');
import {AutoComplete, FlatButton,
    Checkbox, DropDownMenu, MenuItem} from 'material-ui';
var AppConstants = require('constants/AppConstants');
var YearSelector = require('components/common/YearSelector');
import PropTypes from 'prop-types';
import {Bar, Line} from "react-chartjs-2";
var api = require('utils/api');
import {get} from 'lodash';
import {GOOGLE_API_KEY} from 'constants/client_secrets';
var EntityMap = require('components/common/EntityMap');
import Select from 'react-select'
var ReactTooltip = require('react-tooltip');
import loadGoogleMapsAPI from 'load-google-maps-api';
import connectToStores from 'alt-utils/lib/connectToStores';
import {changeHandler} from 'utils/component-utils';

@connectToStores
@changeHandler
export default class AnalysisJournals extends React.Component {
    static propTypes = {
        journals: PropTypes.array,
        annual_viewer_journals: PropTypes.array
    }

    static defaultProps = {
        journals: []
    }

    constructor(props) {
        super(props);
        let user = props.user;
        let questions = [];
        if (user) questions = get(user, 'settings.journals.questions', []);
        let chart_enabled = questions.filter((q) => {
            return q.chart_default;
        }).map((q) => {return q.name;});
        let chartable = questions.filter((q) => {
            return q.chart;
        });
        this.state = {
            tags: [],
            form: {},
            tags_loading: false,
            journal_tag_segment: null,
            journal_segments: {}, // tag.id -> { data: [], labels: [] }
            questions: questions,
            color_scale_question: chartable.length > 0 ? chartable[0] : null,
            chart_enabled_questions: chart_enabled,
            map_showing: false,
            google_maps: null, // Holder for Google Maps object
            annual_viewer_journals: [],
            data_ranges: {}
        };

        this.TAG_COLOR = '#3FE0F2'
        this.TAG_BG_COLOR = `rgba(0, .4, 1, 0.3)`
        this.ANNUAL_VIEWER_COLOR_RANGE = ["CC0000", "00FF00"]
        this.MONTH_LETTERS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
        this.fetch_annual_journals = this.fetch_annual_journals.bind(this)
    }

    static getStores() {
        return [];
    }

    static getPropsFromStores() {
        return {};
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {
        let {form} = this.state
        let annual_key_change = form.annual_viewer_key != prevState.form.annual_viewer_key
        if (annual_key_change) ReactTooltip.rebuild()
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
        return all_selectable_series.map((q, i) => {
            let checked = chart_enabled_questions.indexOf(q.name) > -1;
            return <Checkbox key={i} name={q.name} label={q.label || q.name || "Unlabeled question"} checked={checked} onCheck={this.toggle_series.bind(this, q.name)} />
        });
    }

    numeric_questions() {
        let {questions} = this.state;
        return questions.filter((q) => {
            return AppConstants.NUMERIC_QUESTION_TYPES.indexOf(q.response_type) > -1;
        });
    }

    journal_data() {
        let {chart_enabled_questions, questions, journal_tag_segment} = this.state;
        let {journals} = this.props;
        let labels = [];
        let chart_questions = questions.filter((q) => {
            return q.chart && chart_enabled_questions.indexOf(q.name) > -1;
        });
        let data = {}
        journals.forEach((jrnl) => {
            labels.push(util.date_from_iso(jrnl.iso_date));
            chart_questions.forEach((q) => {
                if (!data[q.name]) data[q.name] = [];
                data[q.name].push(jrnl.data[q.name]);
            });
        });
        let datasets = chart_questions.map((q) => {
            let rgb = util.hexToRgb(q.color || '#FFFFFF');
            return {
                label: q.label,
                data: data[q.name],
                backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
                pointBackgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`
            }
        });
        if (journal_tag_segment) {
            let tag_data = journals.map((j, i) => {
                let all_text = ''
                Object.values(j.data).forEach((val) => {
                    if (typeof val == 'string') all_text += ' ' + val
                })
                let re = new RegExp(journal_tag_segment.id, 'gi')
                let tag_count = (all_text.match(re) || []).length;
                if (tag_count == 0) tag_count = null  // Hide data point if tag not present
                return tag_count
            })
            datasets.push({
                label: `Tagged '${journal_tag_segment.name}'`,
                data: tag_data,
                pointRadius: 7,
                pointHoverRadius: 9,
                backgroundColor: this.TAG_BG_COLOR,
                pointBackgroundColor: this.TAG_COLOR
            })
        }
        return {
            labels: labels,
            datasets: datasets
        }
    }

    handle_tag_input_update(searchText, dataSource, params) {
        let {tags, tags_loading} = this.state;
        if (tags.length == 0 && !tags_loading) {
            this.setState({tags_loading: true}, () => {
                api.get("/api/journaltag", {}, (res) => {
                    this.setState({tags: res.tags, tags_loading: false});
                })
            })
        }
    }

    handle_tag_selected(chosenRequest, index) {
        let {tags, journal_segments, questions} = this.state;
        let {journals} = this.props;
        let tag = tags[index];
        let aggregate = {};
        let variables = questions.filter((q) => {
            return q.tag_segment_chart;
        });
        journals.forEach((j) => {
            let has_tag = j.tags.indexOf(tag.id) > -1;
            variables.forEach((v) => {
                let val = parseFloat(j.data[v.name])
                if (!aggregate[v.name]) aggregate[v.name] = {
                    with: [],
                    without: []
                }
                if (val != null) {
                    if (!isNaN(val)) {
                        if (has_tag) {
                            aggregate[v.name].with.push(val);
                        } else {
                            aggregate[v.name].without.push(val);
                        }
                    }
                }
            })
        });

        // Generate segmentation
        let data_with = [];
        let data_without = [];
        // let labels = [];
        variables.forEach((v) => {
            data_with.push(util.average(aggregate[v.name].with));
            data_without.push(util.average(aggregate[v.name].without));
        });
        journal_segments[tag.id] = {
            data_with_tag: data_with,
            data_without_tag: data_without,
            labels: variables.map((v) => { return v.label || v.name; })
        }
        this.setState({journal_tag_segment: tag, journal_segments: journal_segments});
    }

    get_pins() {
        let {journals} = this.props;
        let {color_scale_question} = this.state;
        return journals.map((jrnl) => {
            let entity = {id: jrnl.id, lat: jrnl.lat, lon: jrnl.lon };
            let val = 0;
            if (color_scale_question) {
                val = jrnl.data[color_scale_question.name];
                entity.value = val;
                entity.label = color_scale_question.label + ": " + val;
            }
            return entity;
        });
    }

    generate_marker(e) {
        let g = this.state.google_maps;
        if (!g) return;
        let {color_scale_question} = this.state;
        let color = 'FFF';
        if (color_scale_question && e.value != null) {
            color = util.colorInterpolate({
                color1: 'ff0000',
                color2: '00ff00',
                min: 1,
                max: 10,
                value: e.value
            });
        }
        return {
            path: g.SymbolPath.CIRCLE,
            fillColor: '#' + color,
            fillOpacity: 1,
            strokeWeight: 3,
            scale: 8
        }
    }

    change_color_scale(event, key, q) {
        this.setState({color_scale_question: q}, () => {
            this.refs.map.refreshMarkers();
        });
    }

    show_map() {
        loadGoogleMapsAPI({
            key: GOOGLE_API_KEY
        }).then((googleMaps) => {
            console.log("Got Google Maps")
            this.setState({google_maps: googleMaps, map_showing: true});
        }).catch((err) => {
            console.error(err);
        });
    }

    fetch_annual_journals() {
        let {form} = this.state
        let open_ended_numeric = this.numeric_questions().filter((q) => q.response_type == 'number_oe')
        if (!form.annual_viewer_key) {
            let qs = this.numeric_questions()
            if (qs.length > 0) {
                form.annual_viewer_key = qs[0].name
            }
        }
        let today = new Date()
        let year = form.annual_viewer_year || today.getFullYear()
        api.get("/api/journal/year", {year: year}, (res) => {
            let data_ranges = {}
            this.numeric_questions().forEach((q) => {
                let min, max
                if (q.response_type == 'number_oe') {
                    // Open range, need to find max and min from fetched data
                    let values = res.journals.map((jrnl) => jrnl.data[q.name])
                    min = Math.min(values)
                    max = Math.max(values)
                } else {
                    // Fixed range
                    min = 1
                    max = 10
                }
                data_ranges[q.name] = {
                    min: min,
                    max: max,
                    reverse: q.value_reverse
                }
            })
            this.setState({annual_viewer_journals: res.journals, form: form, data_ranges: data_ranges}, () => {
                ReactTooltip.rebuild()
            })
        })
    }

    render_annual_viewer() {
        let {form, annual_viewer_journals, data_ranges} = this.state
        let options = this.numeric_questions().map((q) => {
            return {value: q.name, label: q.text}
        })
        let yr = form.annual_viewer_year || (new Date().getFullYear())
        let jan_1 = util.date_from_iso(`${yr}-01-01`)
        let cursor = jan_1
        let grid = []
        let last_month = null
        let have_data = annual_viewer_journals.length > 0
        let key = form.annual_viewer_key
        if (have_data) {
            let idx = 0
            let min_val = data_ranges[key].min
            let max_val = data_ranges[key].max
            while (cursor.getFullYear() == yr) {
                if (cursor.getMonth() != last_month) {
                    // New month
                    grid.push(<span className="monthLabel">{ this.MONTH_LETTERS[cursor.getMonth()] }</span>)
                    last_month = cursor.getMonth()
                }
                let jrnl = annual_viewer_journals[idx]
                let have_date = jrnl != null && jrnl.iso_date == util.iso_from_date(cursor)
                let st = {}
                let iso_date = util.iso_from_date(cursor)
                let tip = iso_date
                if (have_date) {
                    let val = key == null ? 0 : jrnl.data[key]
                    let low_value_idx = data_ranges[key].reverse ? 1 : 0
                    let hi_value_idx = data_ranges[key].reverse ? 0 : 1
                    st.backgroundColor = '#' + util.colorInterpolate({
                        color1: this.ANNUAL_VIEWER_COLOR_RANGE[low_value_idx],
                        color2: this.ANNUAL_VIEWER_COLOR_RANGE[hi_value_idx],
                        min: min_val,
                        max: max_val,
                        value: val
                    })
                    idx += 1
                    tip += `: ${val}`
                } else {
                    st.opacity = 0.5
                }
                grid.push(<span key={iso_date} className="square" data-tip={tip} style={st}></span>)
                cursor.setDate(cursor.getDate() + 1)
            }
        }
        let title = "Annual Viewer"
        if (have_data) title += ` (${yr})`
        return (
            <div className="JournalAnnualView">
                <h5 className="sectionBreak">{title}</h5>
                <div className="row">
                    <div className="col-sm-4">
                        <YearSelector first_year={2016} year={form.annual_viewer_year} onChange={this.changeHandlerVal.bind(this, 'form', 'annual_viewer_year')} />
                    </div>
                    <div className="col-sm-4">
                        <FlatButton onClick={this.fetch_annual_journals} label="Load Journal Data" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-4" hidden={!have_data}>
                        <label>Results for Question</label>
                        <Select options={options}
                                name="annual_viewer_key"
                                onChange={this.changeHandlerVal.bind(this, 'form', 'annual_viewer_key')}
                                value={form.annual_viewer_key}
                                clearable={false}
                                simpleValue />
                    </div>
                </div>

                <div className="row">
                    <div className="grid">
                        { grid }
                    </div>
                </div>

            </div>
        )
    }

    render() {
        let {journal_tag_segment, journal_segments, map_showing } = this.state
        let {loaded} = this.props;
        if (!loaded) return null;
        let _journals_segmented
        let journalData = this.journal_data();
        let journalOptions = {
            scales: {
                yAxes: [{
                    ticks: {
                        max: 10,
                        min: 0,
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
        if (journal_tag_segment) {
            let segmented_data = journal_segments[journal_tag_segment.id];
            let segmented_opts = {
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                max: 10,
                                min: 0,
                                stepSize: 1
                            }
                        }
                    ]
                }
            };
            _journals_segmented = (
                <div>
                    <h4 className="sectionBreak">Journals Segmented by {journal_tag_segment.id}</h4>

                    <Bar options={segmented_opts} data={{
                        labels: segmented_data.labels,
                        datasets: [
                            {
                                label: `With ${journal_tag_segment.id}`,
                                data: segmented_data.data_with_tag,
                                backgroundColor: this.TAG_COLOR
                            },
                            {
                                label: `Without ${journal_tag_segment.id}`,
                                data: segmented_data.data_without_tag,
                                backgroundColor: '#CCC'
                            }
                        ]
                        }} width={1000} height={450} />

                </div>
            );
        }
        if (map_showing) {
            let {color_scale_question} = this.state;
            _map = (
                <div>
                    <label>Select pin color</label><br/>

                    <DropDownMenu onChange={this.change_color_scale.bind(this)} value={color_scale_question}>
                        { this.state.questions.filter((q) => {
                            return q.chart;
                        }).map((q, i) => {
                            return <MenuItem primaryText={q.label} value={q} key={i} />
                        }) }
                    </DropDownMenu>

                    <EntityMap ref="map" entities={this.get_pins()}
                            labelAtt="label"
                            style={{height: "400px"}}
                            google_maps={this.state.google_maps}
                            markerIcon={this.generate_marker.bind(this)} />
                </div>
            )
        }
        return (
            <div>

                <h4>Journals</h4>

                <div>
                { this.render_journal_series_selection() }
                </div>

                <Line data={journalData} options={journalOptions} width={1000} height={450}/>

                <h5 className="sectionBreak">Journals by Tag</h5>

                <AutoComplete
                      hintText="Start typing #tag or @mention..."
                      dataSource={this.state.tags}
                      onUpdateInput={this.handle_tag_input_update.bind(this)}
                      onNewRequest={this.handle_tag_selected.bind(this)}
                      filter={(searchText, key) => searchText !== '' && key.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 }
                      dataSourceConfig={{text: 'id', value: 'id'}}
                      floatingLabelText="View Tag"
                      fullWidth={true}
                    />

                { _journals_segmented }

                { this.render_annual_viewer() }

            </div>
        );
    }
}

module.exports = AnalysisJournals;