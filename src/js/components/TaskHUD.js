var React = require('react');
var util = require('utils/util');
var api = require('utils/api');
import {IconButton} from 'material-ui';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup' // ES6


export default class TaskHUD extends React.Component {
  static propTypes = {
    task: React.PropTypes.object,
    onTaskUpdate: React.PropTypes.func
  }

  static defaultProps = {
    task: null,
    onTaskUpdate: null
  }

  constructor(props) {
      super(props);
      this.state = {
        notified: false,
        working: false
      }
      this.interval_id = null;
      this.POMODORO_MINS = 25;
  }

  componentWillReceiveProps(nextProps) {
    let have_task = !!this.props.task;
    let will_have_task = !!nextProps.task;
    if (have_task != will_have_task) {
      if (will_have_task) this.start_interval();
      else this.stop_interval();
    }
  }

  start_interval() {
    this.interval_id = window.setInterval(this.refresh_timer_count.bind(this), 30*1000);
  }

  stop_interval() {
    if (this.interval_id) window.clearInterval(this.interval_id);
  }

  refresh_timer_count() {
    let {task} = this.props;
    let {notified} = this.state;
    let mins_reached = parseInt(this.get_seconds() / 60);
    let target_mins = parseInt(task.timer_target_ms / 1000 / 60);
    let st = {};
    if (target_mins > 0 && mins_reached == target_mins && !notified) {
      util.notify("Target Reached", `${mins_reached} minutes logged on "${task.title}"`);
      st.notified = true;
    }
    this.setState(st); // Another way to refresh UI?
  }

  get_seconds() {
    let {task} = this.props;
    let ms_on_timer = 0;
    if (task.timer_last_start > 0) ms_on_timer = util.nowTimestamp() - task.timer_last_start;
    ms_on_timer += task.timer_pending_ms;
    return ms_on_timer / 1000;
  }

  playing() {
    let {task} = this.props;
    return task.timer_last_start > 0;
  }

  target_reached() {
    let {task} = this.props;
    let target_ms = task.timer_target_ms;
    if (target_ms > 0) {
      return this.get_seconds() * 1000 >= target_ms;
    } else return false;
  }

  timer_update(params) {
    let {task} = this.props;
    let {working} = this.state;
    params.id = task.id;
    if (!working) {
      util.play_audio('complete.mp3');
      this.setState({working: true}, () => {
        api.post("/api/task", params, (res) => {
          if (res.task) this.props.onTaskUpdate(res.task);
          this.setState({working: false});
        }, (res_err) => {
          this.setState({working: false});
        });
      })
    }
  }

  start_timer() {
    this.timer_update({
      timer_last_start: util.nowTimestamp()
    });
  }

  pause_timer() {
    this.timer_update({
      timer_last_start: 0,
      timer_pending_ms: this.get_seconds() * 1000
    });
  }

  stop_timer() {
    let {task} = this.props;
    let params = {
      timer_last_start: 0,
      wip: 0,
      timer_total_ms: task.timer_total_ms + this.get_seconds() * 1000,
      timer_pending_ms: 0,
      timer_target_ms: 0
    }
    if (this.target_reached()) params.timer_complete_sess = task.timer_complete_sess + 1;
    this.timer_update(params);
  }

  reset_timer() {
    this.timer_update({
      timer_last_start: 0,
      timer_pending_ms: 0
    });
  }

  set_pomodoro() {
    this.setState({notified: false}, () => {
      this.timer_update({
        timer_target_ms: this.POMODORO_MINS * 60 * 1000
      });
    })
  }

  render_controls() {
    let {task} = this.props;
    let {working} = this.state;
    let playing = this.playing();
    let controls = [];
    if (playing) {
      controls.push(<IconButton iconClassName="material-icons" onClick={this.pause_timer.bind(this)} tooltipPosition="top-center" tooltip="Pause Timer" disabled={working}>pause</IconButton>)
    }
    else controls.push(<IconButton iconClassName="material-icons" onClick={this.start_timer.bind(this)} tooltipPosition="top-center" tooltip="Start Timer" disabled={working}>play_arrow</IconButton>)
    controls.push(<IconButton iconClassName="material-icons" onClick={this.set_pomodoro.bind(this)} tooltipPosition="top-center" tooltip={`Set Pomodoro Timer (${this.POMODORO_MINS} minutes)`} disabled={working}>timer</IconButton>)
    controls.push(<IconButton iconClassName="material-icons" onClick={this.stop_timer.bind(this)} tooltipPosition="top-center" tooltip="Stop and Save Logged Time" disabled={working}>stop</IconButton>)
    if (this.get_seconds() > 0) controls.push(<IconButton iconClassName="material-icons" onClick={this.reset_timer.bind(this)} tooltipPosition="top-center" tooltip="Clear & Reset Timer" disabled={working}>restore</IconButton>)
    return controls;
  }

  render() {
    let t = this.props.task;
    let inner;
    if (!t) inner = <span></span>
    else {
      let secs = this.get_seconds();
      let _playing;
      let time_cls = "time";
      let timer_state = "paused";
      if (this.playing()) {
        _playing = <span className="playing-orb"></span>
        time_cls += " playing";
        timer_state = "running";
      }
      let _target, _progress;
      _progress = secs > 0 ? util.secsToDuration(secs, {no_seconds: true, zero_text: "Less than a minute"}) : "--";
      let _check;
      if (t.timer_target_ms > 0) {
        let target_cls = '';
        if (this.target_reached()) {
         target_cls = 'target-reached';
         _check = <i className="glyphicon glyphicon-ok-circle"></i>
        }
        _target = <span className={target_cls}>Target: { util.secsToDuration(t.timer_target_ms / 1000, {no_seconds: true}) } { _check }</span>
      }
      inner = (
        <div className="taskHUD" key="hud">
          <div className="row">
            <div className="col-sm-4">
              <div className="hud-label">work in progress</div>
              <div className="name">{ t.title }</div>
            </div>
            <div className="col-sm-4">
              { this.render_controls() }
            </div>
            <div className="col-sm-4">
              <div className="hud-label">{`Timer (${timer_state})`} { _target }</div>
              <div className="timers">
                <div className={time_cls}>{ _playing }{ _progress }</div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <CSSTransitionGroup transitionName="fade">
        { inner }
      </CSSTransitionGroup>
    );
  }
}
