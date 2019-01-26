var React = require('react');
import PropTypes from 'prop-types';
import {Link} from 'react-router';
var AppConstants = require('constants/AppConstants');
var MobileDialog = require('components/common/MobileDialog');
var BrowserEncryptionWidget = require('components/common/BrowserEncryptionWidget')
import { TextField, IconMenu,
  FlatButton, RaisedButton, IconButton, FontIcon,
  DropDownMenu,
  MenuItem } from 'material-ui';
var util = require('utils/util');
import {changeHandler} from 'utils/component-utils';
var JournalEditor = require('components/JournalEditor');
var api = require('utils/api');
var toastr = require('toastr');
import {clone, merge, without} from 'lodash';

@changeHandler
export default class MiniJournalWidget extends React.Component {
  static propTypes = {
    include_location: PropTypes.bool,
    tomorrow_top_tasks: PropTypes.bool,
    questions: PropTypes.array,
    window_start_hr: PropTypes.number,
    window_end_hr: PropTypes.number
  }

  static defaultProps = {
    questions: [],
    include_location: true,
    tomorrow_top_tasks: true
  }

  constructor(props) {
      super(props);
      this.state = {
        today_data: {},
        form: this.initial_form_state(),
        tasks: [""],
        open: false,
        all_activities: [],
        selected_activities: [],
        historical: false,
        historical_date: null,
        historical_incomplete_dates: [],
        position: null, // {lat, lon}
        submitted_date: null  // ISO date (str)
      };
      this.MAX_TASKS = 3;
      this.NOTIFY_CHECK_MINS = 5;
      this.notify_checker_id = null; // For interval
  }

  componentDidMount() {
    this.maybe_check_if_not_submitted();
    this.notify_checker_id = setInterval(() => {
      this.notify_check();
    }, this.NOTIFY_CHECK_MINS*60*1000);
  }

  componentWillUnmount() {
    if (this.notify_checker_id) clearInterval(this.notify_checker_id);
  }

  initial_form_state() {
    let form = {}
    this.props.questions.forEach((q) => {
      if (q.response_type == 'slider' || q.response_type == 'number') form[q.name] = 5;
    });
    return form;
  }

  journal_form_change(form_data) {
    this.setState({form: form_data});
  }

  notify_check() {
    let {submitted_date, open} = this.state
    if (this.should_notify()) {
      util.notify("Flow Reminder", "Submit your daily journal", "jrnl_remind");
      this.open_journal_dialog();
    } else if (submitted_date != util.iso_from_date(this.current_submission_date())) {
      if (!open) this.setState({today_data: {}})  // Clear prior journal's form data (if dialog not open)
    }
  }

  change_task(i, event) {
    let {tasks} = this.state;
    tasks[i] = event.target.value;
    this.setState({tasks});
  }

  remove_task() {
    let {tasks} = this.state;
    tasks.splice(tasks.length - 1, 1);
    this.setState({tasks});
  }

  add_task() {
    let {tasks} = this.state;
    tasks.push("");
    this.setState({tasks});
  }

  in_journal_window() {
    // End of day
    let d = new Date();
    let hrs = d.getHours();
    return hrs >= this.props.window_start_hr || hrs <= this.props.window_end_hr;
  }

  should_notify() {
    let d = new Date();
    return !this.submitted() && d.getMinutes() <= this.NOTIFY_CHECK_MINS && this.in_journal_window()
  }

  maybe_check_if_not_submitted() {
    if (this.in_journal_window()) {
      this.check_if_not_submitted();
    }
  }

  check_if_not_submitted() {
    // If not yet submitted for day, show dialog
    api.get("/api/journal/today", {}, (res) => {
      let not_submitted = !res.journal || (res.journal && !res.journal.data);
      let st = {submitted_date: not_submitted ? null : res.journal.iso_date}
      if (res.journal != null) st.today_data = res.journal.data
      this.setState(st, () => {
        if (not_submitted) this.open_journal_dialog();
      });
    });
  }

  open_journal_dialog() {
    let {include_location} = this.props;
    let {today_data} = this.state
    if (include_location) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.got_location.bind(this), (failure) => {
          // Failure
          if(failure.message.indexOf("Only secure origins are allowed") == 0) {
            // Secure Origin issue
            toastr.error(`Geolocation disabled? Try secure domain: ${AppConstants.SECURE_BASE}.`);
          } else console.error(failure);
        });
      } else toastr.error(`Browser doesn't support geolocation`);
    }
    let no_today_data = Object.keys(today_data).length == 0
    this.setState({open: true, form: no_today_data ? this.initial_form_state() : clone(today_data)});
  }

  got_location(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    let pos = {lat: lat, lon: lon};
    this.setState({position: pos});
  }

  submit() {
    let {position, tasks, historical, historical_date, historical_incomplete_dates} = this.state;
    let _form = this.state.form;
    let form = clone(_form);
    let params = this.refs.je.get_params();
    merge(params, form);
    if (position) {
      params.lat = position.lat;
      params.lon = position.lon;
    }
    if (historical && historical_date != null) params.date = historical_date;
    if (tasks) {
      params.tasks = JSON.stringify(tasks)
    }
    if (this.refs.encryption_widget.is_verified()) {
      // Do encryption of all text fields
      this.refs.je.text_questions().forEach((q) => {
        params[q.name] = this.refs.encryption_widget.encrypt(params[q.name]) // Replace with AES encrypted text
      })
      params.encrypted = true
    }
    api.post("/api/journal/submit", params, (res) => {
      let st = {submitted_date: util.iso_from_date(this.current_submission_date()), open: false, historical: false, historical_date: null}
      if (historical && historical_date != null) {
        st.form = this.initial_form_state()
        let incomplete_dates = without(historical_incomplete_dates, historical_date)
        st.historical_incomplete_dates = incomplete_dates
      } else {
        st.today_data = res.journal.data
      }
      this.setState(st)
    });
  }

  dismiss() {
    this.setState({open: false, historical: false, historical_date: null});
  }

  render_location() {
    let {include_location} = this.props;
    let {position} = this.state;
    if (!include_location) return null;
    else {
      let position_text = "--";
      if (position) position_text = position.lat + ", " + position.lon;
      return (
        <div className="vpad pull-right">
          <div style={{fontSize: ".7em"}}><b>Location:</b> { position_text }</div>
        </div>
        );
    }
  }

  toggle_historical() {
    let N_DAYS = 7;
    let {historical_incomplete_dates} = this.state;
    let setting_historical = !this.state.historical;
    this.setState({historical: !this.state.historical}, () => {
      if (setting_historical && historical_incomplete_dates.length == 0) {
        api.get("/api/journal", {days: N_DAYS}, (res) => {
          let cursor = new Date();
          let possible_dates = [];
          for (let i = 0; i < N_DAYS - 1; i++) {
            cursor.setDate(cursor.getDate() - 1);
            possible_dates.push(util.printDateObj(cursor));
          }
          if (res.journals) {
            res.journals.forEach((jrnl) => {
              let idx = possible_dates.indexOf(jrnl.iso_date);
              if (idx > -1) possible_dates.splice(idx, 1);
            });
          }
          this.setState({historical_incomplete_dates: possible_dates});
        });

      }
    });
  }

  submitted() {
    let {submitted_date} = this.state
    return submitted_date != null && submitted_date == util.iso_from_date(this.current_submission_date())
  }

  current_submission_date() {
    // Submission date for non-historical journals submitted now
    let d = new Date()
    d.setHours(d.getHours() - AppConstants.JOURNAL_HOURS_BACK)
    return d
  }

  get_journal_date() {
    let {historical, historical_date} = this.state;
    let d
    if (historical && historical_date != null) d = util.date_from_iso(historical_date)
    else d = this.current_submission_date()
    return d
  }

  render_history_section() {
    let {historical, historical_date, historical_incomplete_dates, today} = this.state;
    let _selector;
    if (historical) {
      let today = util.printDateObj(this.current_submission_date());
      let opts = [<MenuItem key='today' value={today} primaryText={`Today (${today})`} />];
      opts = opts.concat(historical_incomplete_dates.map((iso) => {
        return <MenuItem key={iso} value={iso} primaryText={iso} />
      }));
      _selector = (
        <DropDownMenu value={historical_date || today} onChange={this.changeHandlerDropDown.bind(this, null, 'historical_date')}>
          { opts }
        </DropDownMenu>
        );
    }
    return (
      <div>

        <div className="pull-right">
          <span hidden={historical}>
            <IconButton iconClassName="material-icons" onClick={this.toggle_historical.bind(this)}>history</IconButton><br/>
          </span>
          { _selector }
        </div>

        <div className="clearfix"></div>
      </div>
      )
  }

  render_tasks() {
    let {tomorrow_top_tasks} = this.props;
    let {tasks} = this.state;
    if (!tomorrow_top_tasks) return null;
    else {
      let _tasks = tasks.map((task, i) => {
        let task_key = 'task' + (i+1);
        return <TextField key={task_key} placeholder={`Task ${i+1}`} name={task_key} value={task} onChange={this.change_task.bind(this, i)} fullWidth />
      })
      return (
        <div>
          <p className="lead">What are your top couple of tasks for tomorrow?</p>
          { _tasks }
          <span hidden={tasks.length >= this.MAX_TASKS}>
            <RaisedButton label="Add Task" onClick={this.add_task.bind(this)} />
          </span>
          <span hidden={tasks.length == 0}>
            <FlatButton label="Remove Task" onClick={this.remove_task.bind(this)} />
          </span>

        </div>
      )
    }
  }

  render() {
    let {form, open, submitted_date} = this.state;
    let {questions} = this.props;
    let in_window = this.in_journal_window();
    let actions = [
      <BrowserEncryptionWidget ref="encryption_widget" />,
      <RaisedButton label="Save Journal" primary={true} onClick={this.submit.bind(this)} />,
      <FlatButton label="Dismiss" onClick={this.dismiss.bind(this)} />
    ]
    let submitted = this.submitted()
    let _cta = in_window ? <small><div><a href="javascript:void(0)" onClick={this.open_journal_dialog.bind(this)}>{ submitted ? "Update journal" : "Fill journal" }</a></div></small> : <small><div>You can submit at {this.props.window_start_hr}:00. <Link to="/app/settings#journals">Configure journal timing</Link>.</div></small>;
    let _status = (
      <p className="lead">{ submitted ? `Journal submitted for ${submitted_date}, but you can still make edits` : "Journal not yet submitted" }. { _cta }</p>
    )

    let journal_date = util.iso_from_date(this.get_journal_date())
    let title = `Submit Daily Journal (${journal_date})`
    return (
      <div>
        <MobileDialog title={title}
          open={open} onRequestClose={this.dismiss.bind(this)}
          autoDetectWindowHeight={true} autoScrollBodyContent={true}
          actions={actions}>
          <div style={{padding: "10px"}}>
            { this.render_history_section() }

            <JournalEditor ref="je" form={form} onChange={this.journal_form_change.bind(this)} questions={questions} />

            { this.render_tasks() }
            { this.render_location() }
          </div>
        </MobileDialog>

        <div>
          <div className="row">
            <div className="col-sm-6">
              <h3>Daily Journal</h3>
            </div>
            <div className="col-sm-6">
              <IconMenu className="pull-right" iconButtonElement={<IconButton iconClassName="material-icons">more_vert</IconButton>}>
                <Link to="/app/journal/history"><MenuItem key="hist" primaryText="Journal History" leftIcon={<FontIcon className="material-icons">list</FontIcon>} /></Link>
                <MenuItem key="refresh" primaryText="Refresh" onClick={this.maybe_check_if_not_submitted.bind(this)} leftIcon={<FontIcon className="material-icons">refresh</FontIcon>} />
              </IconMenu>
            </div>
          </div>
          { _status }
        </div>
      </div>
    )
  }
}
