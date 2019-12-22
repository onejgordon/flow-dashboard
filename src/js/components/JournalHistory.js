var React = require('react');
var JournalLI = require('components/list_items/JournalLI');
var util = require('utils/util');
import {DatePicker, Paper, Dialog, FlatButton, RaisedButton} from 'material-ui';
import {changeHandler} from 'utils/component-utils';
import connectToStores from 'alt-utils/lib/connectToStores';
var UserStore = require('stores/UserStore');
import {clone, get} from 'lodash';
var FetchedList = require('components/common/FetchedList');
var JournalEditor = require('components/JournalEditor');
var BrowserEncryptionWidget = require('components/common/BrowserEncryptionWidget')
var api = require('utils/api');
import Select from 'react-select'

@connectToStores
@changeHandler
export default class JournalHistory extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
        this.state = {
            form: {
                before_date: new Date(),
                days: 10
            },
            editor_form: {},
            editing_journal: null
        };

        this.maybe_decrypt = this.maybe_decrypt.bind(this)
        this.refresh = this.refresh.bind(this)
    }

    static getStores() {
        return [UserStore]
    }

    static getPropsFromStores() {
        return UserStore.getState()
    }

    componentDidMount() {
        util.set_title("Journal History");
    }

    componentDidUpdate(prevProps, prevState) {
        let filter_change = prevState.form != this.state.form;
        if (filter_change) this.refs.journals.refresh();
    }

    open_editor(j) {
        this.setState({editing_journal: j, editor_form: j ? clone(j.data) : {}});
    }

    get_questions() {
        let {user} = this.props;
        return get(user, 'settings.journals.questions')
    }

    refresh() {
        this.refs.journals.refresh()
    }

    save_journal() {
        let {editing_journal, editor_form} = this.state;
        let encrypt = UserStore.encryption_key_verified()
        if (encrypt) {
            // Do encryption of all text fields
            UserStore.encrypt_journal_text(this.refs.je.text_questions(), editor_form)
        }
        let params = this.refs.je.get_params(editor_form);
        params.encrypted = encrypt ? 1 : 0
        params.id = editing_journal.id;
        api.post("/api/journal", params, (res) => {
            if (res.journal.encrypted) {
                res.journal.data = UserStore.decrypt_journal_text(this.get_questions(), res.journal.data)
            }
            this.refs.journals.update_item_by_key(res.journal, 'id');
            this.setState({submitted: true, open: false, editing_journal: null, editor_form: {}})
        });
    }

    render_journal(j) {
        let {user} = this.props;
        let questions = [];
        if (user) questions = this.get_questions();
        return <JournalLI
                    key={j.id} journal={j}
                    onEditClick={this.open_editor.bind(this, j)}
                    questions={questions} />
    }

    journal_editor_change(form_data) {
        this.setState({editor_form: form_data});
    }

    maybe_decrypt(journal) {
        if (journal.encrypted) {
            journal.data = UserStore.decrypt_journal_text(this.get_questions(), journal.data)
        }
        return journal
    }

    render() {
        let {form, editing_journal, editor_form} = this.state;
        let {user} = this.props;
        let journal_qs = get(user, 'settings.journals.questions', []);
        let params = clone(form);
        let dialog_title = "Edit Journal";
        if (editing_journal) dialog_title += " - " + editing_journal.iso_date;
        if (form.before_date) params.before_date = util.printDateObj(form.before_date);
        let days_opts = [
            { value: 10, label: 10 },
            { value: 20, label: 20 },
            { value: 50, label: 50 }
        ]
        let journal_editor_actions = [
            <BrowserEncryptionWidget ref="encryption_widget" user={user} />,
            <RaisedButton primary={true} label="Save" onClick={this.save_journal.bind(this)} />,
            <FlatButton label="Dismiss" onClick={this.open_editor.bind(this, null)} />,
        ];
        return (
            <div>

                <h1>Journal History</h1>

                <p className="lead">
                    View historical daily journals.
                </p>

                <Dialog
                    title={dialog_title}
                    open={editing_journal != null}
                    onRequestClose={this.open_editor.bind(this, null)}
                    autoDetectWindowHeight={true} autoScrollBodyContent={true}
                    actions={journal_editor_actions}>

                    <JournalEditor ref="je"
                        form={editor_form}
                        onChange={this.journal_editor_change.bind(this)}
                        questions={journal_qs} />

                </Dialog>

                <Paper style={{padding: 10}}>
                    <div className="row">
                        <div className="col-sm-6">
                            <label>Number of Days</label>
                            <Select options={days_opts} value={form.days} onChange={this.changeHandlerVal.bind(this, 'form', 'days')} simpleValue />
                        </div>
                        <div className="col-sm-6">
                            <DatePicker autoOk={true}
                                floatingLabelText="Before Date"
                                formatDate={util.printDateObj}
                                value={form.before_date}
                                onChange={this.changeHandlerNilVal.bind(this, 'form', 'before_date')} />
                        </div>
                    </div>
                </Paper>

                <BrowserEncryptionWidget
                        user={user}
                        labels={["Decrypting", "Enable Decryption"]}
                        onVerify={this.refresh}
                        onClear={this.refresh} />

                <FetchedList ref="journals"
                            url="/api/journal"
                            params={params}
                            listStyle="mui" listProp="journals"
                            per_page={20}
                            processAfterFetched={this.maybe_decrypt}
                            renderItem={this.render_journal.bind(this)}
                            autofetch={true}/>

            </div>
        );
    }
}

module.exports = JournalHistory;
