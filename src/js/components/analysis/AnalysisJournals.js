var React = require('react');
var util = require('utils/util');
import {FlatButton, AutoComplete,
    Checkbox, DropDownMenu, MenuItem} from 'material-ui';
import {Bar, Line} from "react-chartjs-2";
var api = require('utils/api');
import {get} from 'lodash';
import {GOOGLE_API_KEY} from 'constants/client_secrets';
var EntityMap = require('components/common/EntityMap');
import loadGoogleMapsAPI from 'load-google-maps-api';
import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
export default class AnalysisJournals extends React.Component {
    static propTypes = {
        journals: React.PropTypes.array
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
            tags_loading: false,
            journal_tag_segment: null,
            journal_segments: {}, // tag.id -> { data: [], labels: [] }
            questions: questions,
            color_scale_question: chartable.length > 0 ? chartable[0] : null,
            chart_enabled_questions: chart_enabled,
            map_showing: false,
            google_maps: null // Holder for Google Maps object
        };

        this.TAG_COLOR = '#3FE0F2'
    }

    static getStores() {
        return [];
    }

    static getPropsFromStores() {
        return {};
    }

    componentDidMount() {

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
            return <Checkbox key={i} name={q.name} label={q.label} checked={checked} onCheck={this.toggle_series.bind(this, q.name)} />
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
                let tagged = j.tags.indexOf(journal_tag_segment.id) > -1
                return tagged ? 1 : null
            })
            datasets.push({
                label: `Tagged '${journal_tag_segment.name}'`,
                data: tag_data,
                pointRadius: 7,
                pointHoverRadius: 9,
                backgroundColor: this.TAG_COLOR,
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
            data_with.push(util.average(aggregate[v.name].with));
            data_without.push(util.average(aggregate[v.name].without));
        });
        journal_segments[tag.id] = {
            data_with_tag: data_with,
            data_without_tag: data_without,
            labels: variables.map((v) => { return v.label; })
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

    render() {
        let {journal_tag_segment, journal_segments, map_showing } = this.state;
        let {loaded} = this.props;
        if (!loaded) return null;
        let _journals_segmented, _map;
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
                                backgroundColor: this.TAG_COLOR
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

                <div hidden={true}>
                    <FlatButton label="Show Map" onClick={this.show_map.bind(this)} disabled />
                </div>

                { _map }

            </div>
        );
    }
};

module.exports = AnalysisJournals;