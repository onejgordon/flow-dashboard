var React = require('react');
import {Link} from 'react-router';
var UserStore = require('stores/UserStore');
var JournalLI = require('components/list_items/JournalLI');
var util = require('utils/util');
import {DatePicker, Paper} from 'material-ui';
import {changeHandler} from 'utils/component-utils';
import {clone, get} from 'lodash';
var FetchedList = require('components/common/FetchedList');
var toastr = require('toastr');
var Select = require('react-select');

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
            journals: []
        };
    }

    componentDidMount() {
        util.set_title("Journal History");
    }

    componentDidUpdate(prevProps, prevState) {
        let filter_change = prevState.form.reading_filter != this.state.reading_filter;
        if (filter_change) this.refs.readables.refresh();
    }

    render_journal(j) {
        let {user} = this.props;
        let questions = [];
        if (user) questions = get(user, 'settings.journals.questions')
        return <JournalLI
                    key={j.id} journal={j}
                    questions={questions} />
    }

    render() {
        let {form} = this.state;
        let params = clone(form);
        if (form.before_date) params.before_date = util.printDateObj(form.before_date);
        let days_opts = [
            { value: 10, label: 10 },
            { value: 20, label: 20 },
            { value: 50, label: 50 }
        ]
        return (
            <div>

                <h1>Journal History</h1>

                <p className="lead">
                    View historical daily journals.
                </p>

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

                <FetchedList ref="journals"
                            url="/api/journal"
                            params={params}
                            listStyle="mui" listProp="journals"
                            per_page={20}
                            renderItem={this.render_journal.bind(this)}
                            autofetch={true}/>

            </div>
        );
    }
}

module.exports = JournalHistory;
