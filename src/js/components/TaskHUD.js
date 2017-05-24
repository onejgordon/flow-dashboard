var React = require('react');
var util = require('utils/util');
var api = require('utils/api');

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
      this.state = {}
      this.interval_id = null;
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
    this.setState({}); // Another way?
  }

  get_seconds() {
    let {task} = this.props;
    let ms_on_timer = 0;
    if (task.timer_last_start > 0) ms_on_timer = util.nowTimestamp() - task.timer_last_start;
    ms_on_timer += task.timer_pending_ms;
    return ms_on_timer / 1000;
  }

  timer_update(params) {
    console.log(params);
    let {task} = this.props;
    params.id = task.id;
    api.post("/api/task", params, (res) => {
      if (res.task) this.props.onTaskUpdate(res.task);
    });
  }

  start_timer(target_secs) {
    this.timer_update({
      timer_last_start: util.nowTimestamp(),
      timer_target_ms: target_secs * 1000
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
    this.timer_update({
      timer_last_start: 0,
      wip: 0,
      timer_total_ms: task.timer_total_ms + this.get_seconds() * 1000 + task.timer_pending_ms,
      timer_pending_ms: 0
    });
  }

  start_pomodoro() {
    this.start_timer(45 * 60);
  }

  render() {
    let t = this.props.task;
    if (!t) return <span></span>
    let secs = this.get_seconds();
    return (
      <div className="taskHUD">
        <div className="row">
          <div className="col-sm-4">
            <div className="hud-label">work in progress</div>
            <div className="name">{ t.title }</div>
          </div>
          <div className="col-sm-4">
            <a href="javascript:void(0)" onClick={this.start_timer.bind(this, 0)}>start</a>
            <a href="javascript:void(0)" onClick={this.start_pomodoro.bind(this)}>pomodoro</a>
            <a href="javascript:void(0)" onClick={this.pause_timer.bind(this)}>pause</a>
            <a href="javascript:void(0)" onClick={this.stop_timer.bind(this)}>stop</a>
          </div>
          <div className="col-sm-4">
            <span>{ secs } second(s)</span>
          </div>
        </div>

      </div>
    );
  }
}
