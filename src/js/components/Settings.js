var React = require('react');
import {Link} from 'react-router';
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');
var api = require('utils/api');
var UserStore = require('stores/UserStore');
var UserActions = require('actions/UserActions');
var SimpleAdmin = require('components/common/SimpleAdmin');
var AsyncActionButton = require('components/common/AsyncActionButton');
var ReactJsonEditor = require('components/common/ReactJsonEditor');
import Select from 'react-select';
import {RaisedButton, TextField, DatePicker, FontIcon,
    Paper, Tabs, Tab} from 'material-ui';
import {changeHandler} from 'utils/component-utils';
import {get, set, clone} from 'lodash';
import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
@changeHandler
export default class Settings extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
        let user = props.user;
        let form = {};
        let settings = {};
        if (user) {
            form.timezone = user.timezone;
            form.birthday = user.birthday ? util.date_from_iso(user.birthday) : null;
            settings = user.settings;
        }
        this.state = {
            form: form,
            settings: settings,
            tab: "settings",
            saving: false,
            lastSave: util.nowTimestamp()
        };
    }

    static getStores() {
        return [UserStore];
    }

    static getPropsFromStores() {
        return UserStore.getState();
    }

    componentDidMount() {
        util.set_title("Settings");
    }

    componentDidUpdate(prevProps, prevState) {
    }

    gotoTab(tab) {
        this.setState({tab: tab});
    }

    upload_events() {
        let {form} = this.state;
        let params = {events: form.events};
        api.post("/api/event/batch", params, (res) => {
            this.setState({form: {}}, () => {
                if (this.refs.sa) this.refs.sa.fetchItems();
            });
        });
    }

    save_user_settings() {
        let params = clone(this.state.form);
        params.settings = JSON.stringify(this.state.settings);
        if (params.birthday) params.birthday = util.printDateObj(params.birthday);
        this.setState({saving: true}, () => {
            api.post("/api/user/me", params, (res) => {
                if (res.user) UserActions.storeUser(res.user);
                this.setState({saving: false, lastSave: util.nowTimestamp()});
            });
        })
    }

    handle_settings_change(path, index, data) {
        let {user} = this.props;
        let {settings} = this.state;
        if (data == null) {
            // Delete
            get(settings, path).splice(index, 1);
        } else {
            if (index != null) path.push(index);
            set(settings, path, data);
        }
        this.setState({settings: settings, lastChange: util.nowTimestamp()});
    }

    render() {
        let _more;
        var props;
        let {form, tab, settings} = this.state;
        let {user} = this.props;
        let unsaved = this.state.lastSave < this.state.lastChange;
        var tabs = [
            {id: 'settings', label: "User Settings"},
            {id: 'habits', label: "Habits"},
            // {id: 'goals', label: "Goals"},
            // {id: 'projects', label: "Projects"},
            {id: 'events', label: "Events"}
        ];
        if (tab == "habits") {
            props = {
                'url': "/api/habit",
                'id': 'sa',
                'entity_name': "Habits",
                'attributes': [
                    { name: 'id', label: "ID", editable: false, fixed: true },
                    { name: 'name', label: "Name", editable: true },
                    { name: 'description', label: "Description", editable: true },
                    { name: 'color', label: "Color (Hex)", editable: true, showInList: false },
                    { name: 'icon', label: "Icon (From https://material.io/icons/)", editable: true, showInList: false },
                    { name: 'tgt_weekly', label: "Weekly Target", editable: true, showInList: false },
                    { name: 'archived', label: "Archived", editable: true, dataType: 'boolean' }
                ],
                'fetch_params': {},
                'unique_key': 'id',
                'disableDelete': false,
                'max': 50,
                getListFromJSON: function(data) { return data.habits; },
                getObjectFromJSON: function(data) { return data.habit; }
            }
        } else if (tab == "events") {

            props = {
                'url': "/api/event",
                'id': 'sa',
                'entity_name': "Events",
                'attributes': [
                    { name: 'id', label: "ID", editable: false, fixed: true },
                    { name: 'title', label: "Title", editable: true, showInList: true },
                    { name: 'date_start', label: "Date Start (YYYY-MM-DD)", editable: true, showInList: false },
                    { name: 'date_end', label: "Date End (optional, YYYY-MM-DD)", editable: true, showInList: false },
                    { name: 'color', label: "Color (hex)", editable: true, showInList: false }
                ],
                'fetch_params': {},
                'unique_key': 'id',
                'max': 50,
                getListFromJSON: function(data) {
                    return data.events;
                },
                getObjectFromJSON: function(data) { return data.event; }
            }

            _more = (
                <div style={{margin: "10px"}}>
                    <label>Batch Upload from JSON array</label>
                    <p>Each element should be a JSON object that includes properties: <code>title</code> (str), <code>date_start</code> (str, YYYY-MM-DD), <code>date_end</code> (str, optional, YYYY-MM-DD), <code>details</code> (str, optional), <code>color</code> (str, e.g. #FF0000, optional).</p>
                    <TextField placeholder="Events (JSON)" name="events" value={form.events || ""} onChange={this.changeHandler.bind(this, 'form', 'events')} multiLine={true} fullWidth />
                    <RaisedButton label="Batch Upload from JSON" onClick={this.upload_events.bind(this)} />
                </div>
                )


        } else if (tab == "projects") {

            props = {
                'url': "/api/project",
                'id': 'sa',
                'entity_name': "Projects",
                'attributes': [
                    { name: 'id', label: "ID", editable: false, fixed: true },
                    { name: 'title', label: "Title", editable: true },
                    { name: 'subhead', label: "Subhead", editable: true },
                    { name: 'due', label: "Date Due (YYYY-MM-DD)", editable: true },
                    { name: 'url1', label: "URL 1", editable: true, showInList: false },
                    { name: 'url2', label: "URL 2", editable: true, showInList: false }
                ],
                'fetch_params': {},
                'unique_key': 'id',
                'max': 50,
                getListFromJSON: function(data) {
                    return data.projects.map((p) => {
                        return util.spread_array(p, 'urls', 'url', 2);
                    });
                },
                getObjectFromJSON: function(data) { return util.spread_array(data.project, 'urls', 'url', 2); }
            }

        } else if (tab == "settings") {
            let question_atts = [
                { name: 'name', title: 'Variable Name', type: 'text' },
                { name: 'label', title: 'Chart Label', type: 'text' },
                { name: 'text', title: 'Question Text', type: 'text' },
                { name: 'response_type', title: 'Response Type', type: 'dropdown', options: [
                    { value: 'text', label: "Text" },
                    { value: 'number', label: "Number" },
                    { value: 'slider', label: "Slider" }
                    ], default_value: 'text' },
                { name: 'chart', title: 'Is Charted', type: 'checkbox' },
                { name: 'tag_segment_chart', title: 'Tag Segment Chart?', type: 'checkbox' },
                { name: 'chart_default', title: 'Enabled by Default in Chart', type: 'checkbox' },
                { name: 'color', title: 'Chart Series Color (hex)', type: 'text' },
                { name: 'parse_tags', title: 'Enable @mentions and #hashtags', type: 'checkbox' }
            ];
            let flashcard_atts = [
                { name: 'id', title: 'Unique Card ID', type: 'text' },
                { name: 'card_title', title: 'Card Title', type: 'text' },
                { name: 'data_source', title: 'Spreadsheet ID', type: 'text' },
                { name: 'worksheet', title: 'Worksheet Name (Default, first)', type: 'number', default_value: 1},
                { name: 'colstart', title: 'First data column', type: 'text', default_value: 'A' },
                { name: 'colend', title: 'Last data column', type: 'text', default_value: 'F' },
                { name: 'widget_name', title: 'Widget Name', type: 'text' },
                { name: 'title', title: 'Title sheet header', type: 'text' },
                { name: 'subhead', title: 'Subhead sheet header', type: 'text' },
                { name: 'details', title: 'Details sheet header', type: 'text' },
                { name: 'link', title: 'Link sheet header', type: 'text' },
                { name: 'icon', title: 'Icon', type: 'text' }
            ];
            let static_link_atts = [
                { name: 'label', title: 'Label', type: 'text' },
                { name: 'url', title: 'URL', type: 'text' }
            ];
            let tracking_var_atts = [
                { name: 'label', title: 'Label', type: 'text' },
                { name: 'name', title: 'Variable Name', type: 'text' },
                { name: 'color', title: 'Color (hex)', type: 'text' },
                { name: 'mult', title: 'Multiplier (e.g. 0.1)', hint: "Multiplier to scale this variable for easier comparability", type: 'number' },
            ];
            let journal_pref_atts = [
                { name: 'location_capture', title: 'Capture lat/lon upon submission', type: 'checkbox', default_value: false },
                { name: 'journal_start_hour', title: 'Hour after which to collect daily journal', type: 'number', default_value: AppConstants.JOURNAL_START_HOUR },
                { name: 'journal_end_hour', title: 'Hour to stop collecting daily journal', type: 'number', default_value: AppConstants.JOURNAL_END_HOUR },
            ];
            let task_pref_atts = [
                { name: 'same_day_hour', title: 'Hour after which to set new tasks for tomorrow', type: 'number', default_value: 16 },
                { name: 'due_hour', title: 'Hour at which to set tasks due', type: 'number', default_value: 22 },
            ];
            let goal_pref_atts = [
                { name: 'slots', title: 'Maximum number of goals to enter per period', type: 'number', default_value: AppConstants.GOAL_DEFAULT_SLOTS }
            ];
            _more = (
                <Paper style={{padding: "10px", marginTop: "10px"}}>

                    <Tabs>
                        <Tab label="Basics">
                            <div className="row" style={{padding: '10px'}}>
                                <div className="col-sm-6">
                                    <p>
                                        <label>Email</label>
                                        <div>{ user.email }</div>
                                    </p>
                                    <DatePicker autoOk={true} floatingLabelText="Birthday" formatDate={util.printDateObj} value={form.birthday} onChange={this.changeHandlerNilVal.bind(this, 'form', 'birthday')} />
                                </div>
                                <div className="col-sm-6">
                                    <label>Timezone</label>
                                    <Select
                                        options={AppConstants.TIMEZONES}
                                        value={form.timezone}
                                        cancelable={false}
                                        onChange={this.changeHandlerVal.bind(this, 'form', 'timezone')}
                                        placeholder="Select timezone"
                                        simpleValue
                                      />
                                </div>
                            </div>
                        </Tab>

                        <Tab label="Daily Journals">
                            <h3>Daily Journal Questions</h3>

                            <div className="row">
                                <div className="col-md-6">
                                    <p className="lead">
                                        Basic journal preferences.
                                    </p>
                                    <ReactJsonEditor
                                        array={false} data={get(settings, ['journals', 'preferences'], {})}
                                        attributes={journal_pref_atts}
                                        onChange={this.handle_settings_change.bind(this, ['journals', 'preferences'])}
                                        editButtonLabel="Edit Journal Preferences"
                                        />
                                </div>
                                <div className="col-md-6">

                                    <p className="lead">
                                        Configure the questions that you answer in each daily journal.
                                        Responses, if 'chart enabled', can be analyzed on the Analysis page.
                                    </p>

                                    <ReactJsonEditor title="Daily Journal Questions"
                                        array={true} data={get(settings, ['journals', 'questions'], [])}
                                        attributes={question_atts}
                                        icon="question_answer"
                                        onChange={this.handle_settings_change.bind(this, ['journals', 'questions'])}
                                        addButtonLabel="Add Question"
                                        primaryProp="text" secondaryProp="name" />
                                </div>
                            </div>
                        </Tab>

                        <Tab label="Tasks">
                            <h3>Configure Tasks</h3>

                            <ReactJsonEditor
                                array={false} data={get(settings, ['tasks', 'preferences'], {})}
                                attributes={task_pref_atts}
                                onChange={this.handle_settings_change.bind(this, ['tasks', 'preferences'])}
                                editButtonLabel="Edit Task Preferences"
                                />
                        </Tab>

                        <Tab label="Goals">
                            <h3>Configure Goals</h3>

                            <ReactJsonEditor
                                array={false} data={get(settings, ['goals', 'preferences'], {})}
                                attributes={goal_pref_atts}
                                onChange={this.handle_settings_change.bind(this, ['goals', 'preferences'])}
                                editButtonLabel="Edit Goal Preferences"
                                />
                        </Tab>

                        <Tab label="Tracking">
                            <h3>Configure Tracking Chart (Custom Variables)</h3>

                            <p className="lead">
                                Choose which variables to display on the <Link to="/app/analysis/misc">tracking chart</Link>.
                            </p>

                            <ReactJsonEditor title="Tracking Chart Variables"
                                array={true} data={get(settings, ['tracking', 'chart_vars'], [])}
                                attributes={tracking_var_atts}
                                icon="show_chart"
                                onChange={this.handle_settings_change.bind(this, ['tracking', 'chart_vars'])}
                                addButtonLabel="Add Variable"
                                primaryProp="label" secondaryProp="name" />
                        </Tab>

                        <Tab label="More Menu">

                            <br/>
                            <p className="lead">The following items can be added to the <FontIcon className="material-icons">games</FontIcon> more menu that appears at the bottom of the main dashboard.</p>

                            <h3>Configure Flashcards</h3>

                            <p className="lead">
                                Currently, you can configure flashcards to show randomly chosen rows from a Google Spreadsheet.
                            </p>

                            <ReactJsonEditor title="Flashcards"
                                array={true} data={get(settings, ['flashcards'], [])}
                                attributes={flashcard_atts}
                                onChange={this.handle_settings_change.bind(this, ['flashcards'])}
                                addButtonLabel="Add Flashcard"
                                icon="help_outline"
                                primaryProp="card_title" secondaryProp="id" />

                            <h3>Configure Static Links</h3>

                            <ReactJsonEditor title="Static Links"
                                array={true} data={get(settings, ['links'], [])}
                                attributes={static_link_atts}
                                icon="link"
                                onChange={this.handle_settings_change.bind(this, ['links'])}
                                addButtonLabel="Add Link"
                                primaryProp="label" secondaryProp="url" />
                        </Tab>

                        <Tab label="Advanced">
                            <TextField name="password" floatingLabelText="Update API Password" value={form.password} onChange={this.changeHandler.bind(this, 'form', 'password')} /><br/>
                        </Tab>

                    </Tabs>

                    <div className="clearfix">
                        <AsyncActionButton working={this.state.saving} enabled={unsaved} onClick={this.save_user_settings.bind(this)} />
                    </div>

                </Paper>
                )
        }
        var _tabs = tabs.map(function(t, i, arr) {
            var here = this.state.tab == t.id;
            var cn = here ? "active" : "";
            return <li role="presentation" data-t={t.id} className={cn} key={"tab"+i}><a href="javascript:void(0)" onClick={this.gotoTab.bind(this, t.id)}>{t.label}</a></li>
        }, this);
        let _sa = props != null ? <SimpleAdmin ref="sa" {...props} /> : null;
        return (
            <div>

                <h2>Settings</h2>

                <ul className="nav nav-pills">
                    { _tabs }
                </ul>

                { _sa }

                { _more }

            </div>
        );
    }
};

module.exports = Settings;