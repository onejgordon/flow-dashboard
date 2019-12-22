var React = require('react');
import {Link} from 'react-router';
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');
var api = require('utils/api');
var UserStore = require('stores/UserStore');
var UserActions = require('actions/UserActions');
var AsyncActionButton = require('components/common/AsyncActionButton');
var ReactJsonEditor = require('components/common/ReactJsonEditor');
import Select from 'react-select';
import {findItemById} from 'utils/store-utils';
import {TextField, DatePicker, FontIcon,
    Paper, List, ListItem} from 'material-ui';
import {changeHandler} from 'utils/component-utils';
import {get, set, clone} from 'lodash';
import connectToStores from 'alt-utils/lib/connectToStores';
var sha256 = require('js-sha256').sha256;

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
            saving: false,
            lastSave: util.nowTimestamp(),
            subtab: util.getHash("basics")
        };

        this.SUBTABS = [
            { value: "basics", label: "Profile" },
            { value: "journals", label: "Journals" },
            { value: "tasks", label: "Tasks" },
            { value: "goals", label: "Goals" },
            { value: "tracking", label: "Tracking" },
            { value: "more", label: "More" },
            { value: "advanced", label: "Advanced" },
        ]

        this.changeWeekdayStart = this.handle_settings_change.bind(this, ['weekday_start'], null)
    }

    static getStores() {
        return [UserStore];
    }

    static getPropsFromStores() {
        return UserStore.getState();
    }

    componentDidMount() {
        util.set_title("Settings")
    }

    save_user_settings() {
        let params = clone(this.state.form);
        params.settings = JSON.stringify(this.state.settings);
        if (params.birthday) params.birthday = util.printDateObj(params.birthday);
        if (params.encr_password != null) {
            let key = sha256(params.encr_password)
            params.encr_pw_sha = sha256(key)  // Store only hash of key (hash of password)
            delete params.encr_password
        }
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

    goto_subtab(st) {
        this.setState({subtab: st});
    }

    print_subtab_nav() {
        let {subtab} = this.state
        return this.SUBTABS.map((st) => {
            let here = st.value == subtab
            let style = {}
            if (here) style.backgroundColor = '#3885B2'
            return <ListItem
                             key={st.label}
                             primaryText={st.label}
                             style={style}
                             onClick={this.goto_subtab.bind(this, st.value)} />
        })
    }

    render() {
        let _content;
        let {form, settings, subtab} = this.state;
        let {user} = this.props;
        let weekday_start = get(settings, ['weekday_start'], AppConstants.DEFAULT_WEEK_START)
        let unsaved = this.state.lastSave < this.state.lastChange;
        let question_atts = [
            { name: 'name', title: 'Variable Name', type: 'text' },
            { name: 'label', title: 'Chart Label', type: 'text' },
            { name: 'text', title: 'Question Text', type: 'text' },
            { name: 'response_type', title: 'Response Type', type: 'dropdown', options: [
                { value: 'text', label: "Text" },
                { value: 'slider', label: "Slider" },
                { value: 'number', label: "Number" },
                { value: 'number_oe', label: "Number (Free Input Box)" }
                ], default_value: 'text' },
            { name: 'chart', title: 'Is Charted', type: 'checkbox' },
            { name: 'tag_segment_chart', title: 'Tag Segment Chart?', type: 'checkbox' },
            { name: 'chart_default', title: 'Enabled by Default in Chart', type: 'checkbox' },
            { name: 'color', title: 'Chart Series Color (hex)', type: 'text' },
            { name: 'parse_tags', title: 'Enable @mentions and #hashtags', type: 'checkbox' },
            { name: 'value_reverse', title: 'Reverse values (lower is better)', type: 'checkbox', default_value: false },
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
        let common_task_atts = [
            { name: 'title', title: 'Task title', type: 'text' }
        ]
        let subtab_title = findItemById(this.SUBTABS, subtab, 'value').label;
        _content = (
            <div className="row">
                <div className="col-sm-3">
                    <List>
                        { this.print_subtab_nav() }
                    </List>
                    <AsyncActionButton
                            working={this.state.saving}
                            enabled={unsaved}
                            fullWidth={true}
                            onClick={this.save_user_settings.bind(this)} />
                </div>
                <div className="col-sm-9">
                    <Paper style={{padding: "15px", marginTop: "10px"}}>
                        <h2 style={{marginTop: "0px"}}>{ subtab_title }</h2>
                        <div hidden={subtab != "basics"}>
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

                                    <div className="vpad">
                                        <label>Week Start</label>
                                        <p>You can configure how Flow decides the start and end of each week, for example, to calculate weekly habit targets</p>

                                        <Select
                                            options={AppConstants.WEEKDAYS}
                                            value={weekday_start}
                                            cancelable={false}
                                            onChange={this.changeWeekdayStart}
                                            placeholder="Select start of week"
                                            simpleValue
                                          />
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div hidden={subtab != "journals"}>
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
                        </div>

                        <div hidden={subtab != "tasks"}>
                            <h3>Configure Tasks</h3>

                            <div className="row">
                                <div className="col-sm-6">
                                    <ReactJsonEditor
                                        array={false} data={get(settings, ['tasks', 'preferences'], {})}
                                        attributes={task_pref_atts}
                                        onChange={this.handle_settings_change.bind(this, ['tasks', 'preferences'])}
                                        editButtonLabel="Edit Task Preferences"
                                        />
                                </div>
                                <div className="col-sm-6">
                                    <p>To reduce the repetition of adding common tasks that recur frequently, you can configure
                                    a list of common tasks. These can be added in a batch from the task widget's menu.</p>

                                    <ReactJsonEditor title="Common Tasks"
                                        array={true} data={get(settings, ['tasks', 'common_tasks'], [])}
                                        attributes={common_task_atts}
                                        icon="playlist_add_check"
                                        onChange={this.handle_settings_change.bind(this, ['tasks', 'common_tasks'])}
                                        addButtonLabel="Add Common Task"
                                        primaryProp="title" />

                                </div>
                            </div>
                        </div>

                        <div hidden={subtab != "goals"}>
                            <h3>Configure Goals</h3>

                            <ReactJsonEditor
                                array={false} data={get(settings, ['goals', 'preferences'], {})}
                                attributes={goal_pref_atts}
                                onChange={this.handle_settings_change.bind(this, ['goals', 'preferences'])}
                                editButtonLabel="Edit Goal Preferences"
                                />
                        </div>

                        <div hidden={subtab != "tracking"}>
                            <h3>Configure Tracking Chart (Custom Variables)</h3>

                            <p className="lead">
                                Choose which variables to display on the <Link to="/app/analysis/misc">tracking chart</Link>. View raw tracking data <Link to="/app/tracking/history">here</Link>.
                            </p>

                            <ReactJsonEditor title="Tracking Chart Variables"
                                array={true} data={get(settings, ['tracking', 'chart_vars'], [])}
                                attributes={tracking_var_atts}
                                icon="show_chart"
                                onChange={this.handle_settings_change.bind(this, ['tracking', 'chart_vars'])}
                                addButtonLabel="Add Variable"
                                primaryProp="label" secondaryProp="name" />
                        </div>

                        <div hidden={subtab != "more"}>

                            <br/>
                            <p className="lead">The following items can be added to the <FontIcon className="material-icons">games</FontIcon> more menu that appears at the bottom of the main dashboard.</p>

                            <h3>Configure Static Links</h3>

                            <ReactJsonEditor title="Static Links"
                                array={true} data={get(settings, ['links'], [])}
                                attributes={static_link_atts}
                                icon="link"
                                onChange={this.handle_settings_change.bind(this, ['links'])}
                                addButtonLabel="Add Link"
                                primaryProp="label" secondaryProp="url" />

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

                        </div>

                        <div hidden={subtab != "advanced"}>
                            <h3>In-Browser Encryption</h3>
                            <p>As an extra layer of privacy, you can optionally set an encryption password which will never hit the server, and allows in-browser encryption/decryption of sensitive text fields (e.g. open-ended journal fields). Once set, save or memorize this password as it cannot be shown again. <em>Data previously encrypted can only be recovered with the password used at time of submission.</em></p>
                            <small>We use a strategy proposed for client-side encryption of health information, see <a href="https://bmcmedinformdecismak.biomedcentral.com/articles/10.1186/1472-6947-11-70">Web-browser encryption of personal health information</a> for details. For the most security, we recommend using a password generated by a password manager like <a href="https://www.lastpass.com" target="_blank">LastPass</a>.</small>
                            <TextField name="encr_password" type="password" floatingLabelText="Update Encryption Password" value={form.encr_password || ''} onChange={this.changeHandler.bind(this, 'form', 'encr_password')} /><br/>

                            <h3>API Access</h3>
                            <p>Once set, save or memorize this password as it cannot be shown again.</p>
                            <TextField name="password" type="password" floatingLabelText="Update API Password" value={form.password || ''} onChange={this.changeHandler.bind(this, 'form', 'password')} /><br/>

                        </div>

                    </Paper>

                </div>
            </div>

            )
        return (
            <div>

                <h2>Settings</h2>

                { _content }

            </div>
        );
    }
}

module.exports = Settings;