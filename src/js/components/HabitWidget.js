var React = require('react');
import { FontIcon, IconButton } from 'material-ui';
var util = require('utils/util');
var api = require('utils/api');
import {cyanA400} from 'material-ui/styles/colors';
var moment = require('moment-timezone');
var AppConstants = require('constants/AppConstants')

export default class HabitWidget extends React.Component {
  static defaultProps = {
    days: 7,
    commitments: true
  }
  constructor(props) {
      super(props);
      this.state = {
          habits: [],
          habitdays: {},
          habit_week_start: this.get_habit_week_start()
      };
      this.COMMIT_COLOR = '#F9D23D';
  }

  componentDidMount() {
    this.fetch_current();
  }

  fetch_current() {
    api.get("/api/habit/recent", {days: this.props.days}, (res) => {
      // dict of ids to habit days (if present)
      this.setState({habits: res.habits, habitdays: res.habitdays});
    });
  }

  update_habitday_in_state(hd) {
    let {habitdays} = this.state;
    habitdays[hd.id] = hd;
    this.setState({habitdays});
  }

  day_action(habit, iso_day, action) {
    let params = {
      habitday_id: this.make_id(habit.id, iso_day),
      habit_id: habit.id,
      date: iso_day
    }
    api.post(`/api/habit/${action}`, params, (res) => {
      if (res.habitday) {
        this.update_habitday_in_state(res.habitday);
      }
    });
  }

  toggle_day(habit, iso_day) {
    this.day_action(habit, iso_day, 'toggle');
  }

  commit(habit, iso_day) {
    this.day_action(habit, iso_day, 'commit');
  }

  make_id(habit_id, iso_day) {
    let id = "habit:"+habit_id+"_day:"+iso_day;
    return id;
  }

  get_habit_week_start() {
    let today = new Date();
    let since_start = today.getDay() - AppConstants.HABIT_WEEK_START;
    if (since_start < 0) since_start += 7;
    today.setDate(today.getDate() - since_start);
    let latest_start = today;
    return latest_start;
  }

  day_in_current_habit_week(date) {
    let {habit_week_start} = this.state;
    return date >= habit_week_start;
  }

  render_commitment_alert() {
    let {commitments} = this.props;
    let {habits, habitdays} = this.state;
    let today_iso = util.printDateObj(new Date());
    let n_undone_commits = 0;
    habits.forEach((h) => {
      let id = this.make_id(h.id, today_iso);
      let hd = habitdays[id];
      let committed = hd && hd.committed && !hd.done;
      if (committed) n_undone_commits += 1;
    });
    if (n_undone_commits > 0) return <p className="lead" style={{color: this.COMMIT_COLOR}}>You have <b>{n_undone_commits}</b> unfinished commitment(s) today!</p>
    else return null;
  }

  render_day_headers() {
    let {days, commitments} = this.props;
    let cursor = new Date();
    let today = new Date();
    let res = [];
    cursor.setDate(cursor.getDate() - days + 1);
    while (cursor <= today) {
      let d = util.printDate(cursor.getTime(), "MMM DD");
      let in_week = this.day_in_current_habit_week(cursor);
      let cls = in_week ? "current-habit-week" : "";
      res.push(<th key={d} className={cls}>{d}</th>);
      cursor.setDate(cursor.getDate() + 1);
    }
    if (commitments) res.push(<th key="cmt" className="current-habit-week">Commit</th>);
    res.push(<th key="tgt" className="current-habit-week">Target</th>); // progress header
    return res;
  }

  render_habit(h) {
    let {days, commitments} = this.props;
    let {habitdays} = this.state;
    let _progress;
    let cursor = new Date();
    let today = new Date();
    let res = [];
    let done_in_week = 0;
    let today_iso = util.printDateObj(new Date());
    var done = false, committed = false;
    cursor.setDate(cursor.getDate() - days + 1);
    while (cursor <= today) {
      let iso_day = util.printDateObj(cursor);
      let is_today = iso_day == today_iso;
      let id = this.make_id(h.id, iso_day);
      let in_week = this.day_in_current_habit_week(cursor);
      if (habitdays[id]) {
        let hd = habitdays[id];
        done = hd.done;
        committed = hd.committed;
      } else {
        done = false;
        committed = false;
      }
      let icon = 'check';
      if (done) icon = h.icon || 'check_circle';
      if (done && in_week) done_in_week += 1;
      let st = {};
      if (done) st.color = h.color || cyanA400;
      else if (committed) st.color = this.COMMIT_COLOR;
      if (!in_week) st.opacity = 0.6;
      let tt = done ? "Mark Not Done" : "Mark Done";
      res.push(<td key={iso_day}>
        <IconButton iconClassName="material-icons"
            onClick={this.toggle_day.bind(this, h, iso_day)}
            tooltip={tt}
            iconStyle={st}>{icon}
        </IconButton></td>);
      cursor.setDate(cursor.getDate() + 1);
    }
    let st = {color: h.color || "#FFFFFF" };
    if (h.tgt_weekly) {
      let target_reached = done_in_week >= h.tgt_weekly;
      let target_near = h.tgt_weekly - done_in_week == 1;
      let _icon;
      let cls = "";
      if (target_reached) {
        cls = "target-reached";
        _icon = <i className="glyphicon glyphicon-ok-circle"></i>
      }
      if (target_near) {
        cls = "target-near";
        _icon = <i className="glyphicon glyphicon-flash"></i>
      }
      _progress = <span className={"target " + cls}>{done_in_week} / {h.tgt_weekly} { _icon }</span>
    }
    let _commitment;
    if (commitments) _commitment = (
        <td className="text-center">
          { (!done && !committed) ?
          <IconButton iconClassName="material-icons"
            onClick={this.commit.bind(this, h, today_iso)}
            tooltip="Commit"
            iconStyle={{color: this.COMMIT_COLOR}}>fast_forward
          </IconButton>
          : null }
        </td>
    )
    return (
      <tr key={h.id}>
        <td className="text-center">
          <b style={st}>{ h.name }</b>
        </td>
        {res}
        { _commitment }
        <td className="text-center">
          { _progress }
        </td>
      </tr>
      );
  }

  render() {
    let {habits} = this.state;
    return (
      <div className="HabitWidget" id="HabitWidget">
        <h3>Habits</h3>
        { this.render_commitment_alert() }

        <table width="100%" style={{backgroundColor: "rgba(0,0,0,0)"}}>
          <thead>
          <tr>
            <th></th>
            { this.render_day_headers() }
          </tr>
          </thead>
          <tbody>
          { habits.map((h) => {
            return this.render_habit(h);
          }) }
          </tbody>
        </table>
      </div>
    )
  }
}
