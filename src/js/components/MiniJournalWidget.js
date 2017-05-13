var React = require('react');
import {Link} from 'react-router';
var AppConstants = require('constants/AppConstants');
import { Dialog, TextField, Slider,
  FlatButton, RaisedButton, IconButton, List,
  ListItem, Paper, DropDownMenu,
  MenuItem } from 'material-ui';
var util = require('utils/util');
import {changeHandler} from 'utils/component-utils';
var api = require('utils/api');
var toastr = require('toastr');

@changeHandler
export default class MiniJournalWidget extends React.Component {
  static propTypes = {
    include_location: React.PropTypes.bool,
    tomorrow_top_tasks: React.PropTypes.bool,
    questions: React.PropTypes.array,
    window_start_hr: React.PropTypes.number,
    window_end_hr: React.PropTypes.number
  }

  static defaultProps = {
    questions: [],
    include_location: true,
    tomorrow_top_tasks: true
  }

  constructor(props) {
      super(props);
      let form = {}
      this.props.questions.forEach((q) => {
        if (q.response_type == 'slider' || q.response_type == 'number') form[q.name] = 5;
      });
      this.state = {
        form: form,
        tasks: [""],
        open: false,
        all_activities: [],
        selected_activities: [],
        // Tags
        tags: [],
        tags_loading: false,
        tags_loaded: false,
        historical: false,
        historical_date: null,
        historical_incomplete_dates: [],
        position: null, // {lat, lon}
        submitted: false
      };
      this.MAX_TASKS = 3;
      this.NOTIFY_CHECK_MINS = 5;
      this.notify_checker_id = null; // For interval
  }

  componentDidMount() {
    let {tags_loading, tags_loaded} = this.state;
    if (this.in_journal_window()) {
      this.check_if_not_submitted();
    }
    if (!tags_loading && !tags_loaded) this.fetch_tags();
    this.notify_checker_id = setInterval(() => {
      this.notify_check();
    }, this.NOTIFY_CHECK_MINS*60*1000);
  }

  componentWillUnmount() {
    if (this.notify_checker_id) clearInterval(this.notify_checker_id);
  }

  notify_check() {
    if (this.should_notify()) {
      util.notify("Flow Reminder", "Submit your daily journal", "jrnl_remind");
      this.open_journal_dialog();
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
    if (!this.state.submitted && d.getMinutes() <= this.NOTIFY_CHECK_MINS) {
      return this.in_journal_window();
    }
  }

  check_if_not_submitted() {
    // If not yet submitted for day, show dialog
    api.get("/api/journal/today", {}, (res) => {
      let not_submitted = !res.journal || (res.journal && !res.journal.data);
      this.setState({submitted: !not_submitted}, () => {
        if (not_submitted) this.open_journal_dialog();
      });
    });
  }

  open_journal_dialog() {
    let {include_location} = this.props;
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
    this.setState({open: true});
  }

  got_location(position) {
    console.log(position);
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    let pos = {lat: lat, lon: lon};
    this.setState({position: pos});
  }

  submit() {
    let {questions} = this.props;
    let {form, position, tasks, historical, historical_date} = this.state;
    let form_data = JSON.stringify(form);
    let params = {};
    params.data = form_data;
    if (position) {
      params.lat = position.lat;
      params.lon = position.lon;
    }
    if (historical && historical_date != null) params.date = historical_date;
    questions.forEach((q) => {
      if (q.parse_tags) params.tags_from_text = form[q.name];
    });
    if (tasks) {
      params.tasks = JSON.stringify(tasks)
    }
    api.post("/api/journal", params, (res) => {
      this.setState({submitted: true, open: false})
    });
  }

  dismiss() {
    this.setState({open: false});
  }

  fetch_tags() {
    api.get("/api/journaltag", {}, (res) => {
      this.setState({tags: res.tags});
    })
  }

  handle_tag_add(tag, qname) {
    let {form} = this.state;
    let val = form[qname];
    let idx = val.lastIndexOf(tag.type == 1 ? '@' : '#');
    if (idx > -1) {
      form[qname] = form[qname].slice(0, idx) + tag.id + ' ';
    }
    this.setState({form}, () => {
      this.refs[qname].focus();
    });
  }

  filtered_tags(search) {
    let {tags} = this.state;
    let person = search.startsWith('@');
    let stripped = search.slice(1); // Without prefix
    let type = person ? 1 : 2;
    return tags.filter((tag) => {
      return tag.name.toLowerCase().indexOf(stripped.toLowerCase()) > -1 && tag.type == type;
    });
  }

  render_tag_suggest(str, qname) {
    let {tags_loading} = this.state;
    let entering_tag = false;
    let _content, _selector;
    let last_space = str.lastIndexOf(' ');
    let last_word = "";
    if (last_space > -1) {
      last_word = str.slice(last_space + 1);
    } else {
      last_word = str;
    }
    if (last_word.startsWith('#') || last_word.startsWith('@')) {
      entering_tag = true;
    }
    if (entering_tag) {
      if (tags_loading) _content = "Loading";
      else {
        let lis = this.filtered_tags(last_word).map((tag) => {
          return <ListItem primaryText={tag.name} onClick={this.handle_tag_add.bind(this, tag, qname)} />
        })
        if (lis.length == 0) _content = <div className="empty">No suggestions</div>
        else _content = (
          <List>
            { lis }
          </List>
        );
      }
      _selector = (
        <Paper style={{maxHeight: "400px"}}>
          { _content }
        </Paper>
      );

    }
    return (
      <div>
        { _selector }
      </div>
    );
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
    let N_DAYS = 4;
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
              let iso_date = jrnl.iso_date;
              let idx = possible_dates.indexOf(jrnl.iso_date);
              if (idx > -1) possible_dates.splice(idx, 1);
            });
          }
          this.setState({historical_incomplete_dates: possible_dates});
        });

      }
    });
  }

  render_history_section() {
    let {historical, historical_date, historical_incomplete_dates, today} = this.state;
    let _selector;
    if (historical) {
      let today = util.printDateObj(new Date);
      let opts = [<MenuItem value={today} primaryText={`Today (${today})`} />];
      opts = opts.concat(historical_incomplete_dates.map((iso) => {
        return <MenuItem value={iso} primaryText={iso} />
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

  render_questions() {
    let {questions} = this.props;
    let {form} = this.state;
    return questions.map((q, i) => {
      let _response;
      let _tags;
      let _hint;
      let val = form[q.name];
      if (q.parse_tags) {
        _tags = this.render_tag_suggest(val || "", q.name);
        _hint = <small>You can @mention and #activity tag</small>
      }
      if (!q.response_type || q.response_type == 'text') _response = <TextField name={q.name} ref={q.name} value={val} onChange={this.changeHandler.bind(this, 'form', q.name)} fullWidth={true} />
      else if (q.response_type == 'slider' || q.response_type == 'number') _response = <Slider name={q.name} value={val} onChange={this.changeHandlerSlider.bind(this, 'form', q.name)} max={10} min={1} defaultValue={5} step={1} />
      return (
        <div key={i}>
          <p className="lead">{ q.text }</p>
          { _hint }
          { _response }
          { _tags }
        </div>
      )
    });
  }

  render_tasks() {
    let {tomorrow_top_tasks} = this.props;
    let {form, tasks} = this.state;
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
    let {form, open, submitted} = this.state;
    let in_window = this.in_journal_window();
    let actions = [
      <RaisedButton label="Submit" primary={true} onClick={this.submit.bind(this)} />,
      <FlatButton label="Later" onClick={this.dismiss.bind(this)} />
    ]
    let _cta;
    if (!submitted) _cta = in_window ? <small><div><a href="javascript:void(0)" onClick={this.open_journal_dialog.bind(this)}>Submit now</a></div></small> : <small><div>You can submit at {this.props.window_start_hr}:00. <Link to="/app/manage">Configure journal timing</Link>.</div></small>;
    let _status = (
      <p className="lead">{ submitted ? "Journal submitted" : "Journal not yet submitted" }. { _cta }</p>
    )
    return (
      <div>
        <Dialog title="Submit Daily Journal"
          open={open} onRequestClose={this.dismiss.bind(this)}
          autoDetectWindowHeight={true} autoScrollBodyContent={true}
          actions={actions}>
          <div style={{padding: "10px"}}>
            { this.render_history_section() }
            { this.render_questions() }
            { this.render_tasks() }
            { this.render_location() }
          </div>
        </Dialog>

        <div>
          <h3>Daily Journal</h3>
          { _status }
          <div>See <Link to="/app/journal/history">journal history</Link>.</div>
        </div>
      </div>
    )
  }
}
