var React = require('react');

var util = require('utils/util');
var api = require('utils/api');
var UserStore = require('stores/UserStore');
var UserActions = require('actions/UserActions');
var SimpleAdmin = require('components/common/SimpleAdmin');
var ReactJsonEditor = require('components/common/ReactJsonEditor');
import {FlatButton, RaisedButton, TextField,
    Paper} from 'material-ui';
import {changeHandler} from 'utils/component-utils';
import {get, set, clone} from 'lodash';
import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
@changeHandler
export default class Manage extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
        let user = props.user;
        let form = {};
        let settings = {};
        if (user) {
            form.timezone = user.timezone;
            form.birthday = user.birthday;
            settings = user.settings;
        }
        this.state = {
            form: form,
            settings: settings,
            tab: "settings"
        };
    }

    static getStores() {
        return [UserStore];
    }

    static getPropsFromStores() {
        return UserStore.getState();
    }

    componentDidMount() {
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

        });
    }

    save_user_settings() {
        let params = clone(this.state.form);
        params.settings = JSON.stringify(this.state.settings);
        api.post("/api/user/me", params, (res) => {
            if (res.user) UserActions.storeUser(res.user);
        });
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

        this.setState({settings: settings});
    }

    render() {
        let _more;
        var props;
        let {form, tab, settings} = this.state;
        let {user} = this.props;
        var tabs = [
            {id: 'settings', label: "User Settings"},
            {id: 'habits', label: "Habits"},
            {id: 'goals', label: "Goals"},
            {id: 'projects', label: "Projects"},
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
                    { name: 'color', label: "Color (Hex)", editable: true, showInList: false },
                    { name: 'icon', label: "Icon (From https://material.io/icons/)", editable: true, showInList: false },
                    { name: 'tgt_weekly', label: "Weekly Target", editable: true, showInList: false },
                    { name: 'archived', label: "Archived", editable: true, dataType: 'boolean' }
                ],
                'fetch_params': {},
                'unique_key': 'id',
                'max': 50,
                getListFromJSON: function(data) { return data.habits; },
                getObjectFromJSON: function(data) { return data.habit; }
            }
        } else if (tab == "goals") {

            props = {
                'url': "/api/goal",
                'id': 'sa',
                'entity_name': "Goals",
                'attributes': [
                    { name: 'id', label: "ID", editable: true, fixed: true },
                    { name: 'text1', label: "Goal 1", editable: true, showInList: true },
                    { name: 'text2', label: "Goal 2", editable: true, showInList: false },
                    { name: 'text3', label: "Goal 3", editable: true, showInList: false },
                    { name: 'text4', label: "Goal 4", editable: true, showInList: false },
                    { name: 'assessment', label: "Assessment (1-5)", editable: true, showInList: false }
                ],
                'fetch_params': {},
                'unique_key': 'id',
                'max': 50,
                getListFromJSON: function(data) {
                    return data.goals.map((g) => {
                        return util.spread_array(g, 'text', 'text', 4);
                    });
                },
                getObjectFromJSON: function(data) { return util.spread_array(data.goal, 'text', 'text', 4); }
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
                    <TextField placeholder="Events (JSON)" name="events" value={form.events} onChange={this.changeHandler.bind(this, 'form', 'events')} multiLine={true} fullWidth />
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
                    { value: 'number', label: "Number (Slider)" }
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
                { name: 'colstart', title: 'First data column', type: 'text', default_value: 'A' },
                { name: 'colend', title: 'Last data column', type: 'text', default_value: 'F' },
                { name: 'widget_name', title: 'Widget Name', type: 'text' },
                { name: 'title', title: 'Title sheet header', type: 'text' },
                { name: 'subhead', title: 'Subhead sheet header', type: 'text' },
                { name: 'details', title: 'Details sheet header', type: 'text' },
                { name: 'link', title: 'Link sheet header', type: 'text' },
                { name: 'icon', title: 'Icon', type: 'text' }
            ];
            let journal_pref_atts = [
                { name: 'location_capture', title: 'Capture Lat/Lon Upon Submission', type: 'checkbox', default_value: false },
            ];
            _more = (
                <Paper style={{padding: "10px", marginTop: "10px"}}>
                    <h2>{ user.email }</h2>
                    <TextField name="timezone" placeholder="Timezone" value={form.timezone} onChange={this.changeHandler.bind(this, 'form', 'timezone')} /><br/>
                    <TextField name="birthday" placeholder="Birthday (YYYY-MM-DD)" value={form.birthday} onChange={this.changeHandler.bind(this, 'form', 'birthday')} /><br/>

                    <h3>Daily Journal Questions</h3>

                    <p className="lead">
                        Configure the questions that you answer in each daily journal.
                        Responses, if 'chart enabled', can be analyzed on the Analysis page.
                    </p>

                    <ReactJsonEditor
                        array={false} data={get(settings, ['journals', 'preferences'], {})}
                        attributes={journal_pref_atts}
                        onChange={this.handle_settings_change.bind(this, ['journals', 'preferences'])}
                        editButtonLabel="Edit Preferences"
                        />

                    <ReactJsonEditor title="Daily Journal Questions"
                        array={true} data={get(settings, ['journals', 'questions'], [])}
                        attributes={question_atts}
                        onChange={this.handle_settings_change.bind(this, ['journals', 'questions'])}
                        addButtonLabel="Add Question"
                        primaryProp="text" secondaryProp="name" />

                    <h3>Configure Flashcards</h3>

                    <p className="lead">
                        Flashcards appear on the main dashboard in the more menu.
                        You can configure flashcards to show randomly chosen rows from a Google Spreadsheet.
                    </p>

                    <ReactJsonEditor title="Flashcards"
                        array={true} data={get(settings, ['flashcards'], [])}
                        attributes={flashcard_atts}
                        onChange={this.handle_settings_change.bind(this, ['flashcards'])}
                        addButtonLabel="Add Flashcard"
                        primaryProp="card_title" secondaryProp="id" />

                    <RaisedButton primary={true} label="Save" onClick={this.save_user_settings.bind(this)} />

                </Paper>
                )
        }
        var _tabs = tabs.map(function(t, i, arr) {
            var here = this.state.tab == t.id;
            var cn = here ? "active" : "";
            return <li role="presentation" data-t={t.id} className={cn} key={"tab"+i}><a href="javascript:void(0)" onClick={this.gotoTab.bind(this, t.id)}>{t.label}</a></li>
        }, this);
        let _sa = props != null ? <SimpleAdmin {...props} /> : null;
        return (
            <div>

                <h2>Manage</h2>

                <ul className="nav nav-pills">
                    { _tabs }
                </ul>

                { _sa }

                { _more }

            </div>
        );
    }
};

module.exports = Manage;