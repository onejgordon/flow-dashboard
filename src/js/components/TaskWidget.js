var React = require('react');
import { IconButton, List,
  RaisedButton, TextField, Paper,
  FlatButton } from 'material-ui';
var util = require('utils/util');
var api = require('utils/api');
var TaskLI = require('components/list_items/TaskLI');
import {findIndexById, removeItemsById} from 'utils/store-utils';
var ProgressLine = require('components/common/ProgressLine');
var toastr = require('toastr');
var AsyncActionButton = require('components/common/AsyncActionButton');
import {changeHandler} from 'utils/component-utils';

@changeHandler
export default class TaskWidget extends React.Component {
  static propTypes = {
    timezone: React.PropTypes.string,
    show_task_progressbar: React.PropTypes.bool
  }

  static defaultProps = {
    timezone: "UTC",
    show_task_progressbar: true
  }
  constructor(props) {
      super(props);
      this.state = {
          tasks: [],
          form: {},
          new_showing: false
      };
      this.I_ST = {
        fontSize: 20
      }
      this.IB_ST = {
        padding: 10,
        width: 20,
        height: 20
      }
      this.TASK_COLOR = "#DF00FF";
  }

  componentDidMount() {
    this.fetch_recent();
  }

  fetch_recent() {
    api.get("/api/task", {}, (res) => {
      this.setState({tasks: res.tasks});
    });
  }

  update_status(task, status) {
    // Toggle done on server
    let params = {
      id: task.id,
      status: status
    }
    util.play_audio('complete.mp3');
    api.post("/api/task", params, (res) => {
      if (res.task) {
        let {tasks} = this.state;
        let n_undone = 0;
        tasks.forEach((task, i) => {
          if (task.id == res.task.id) tasks[i] = res.task;
          else if (!task.done) n_undone += 1;
        });
        let idx = findIndexById(tasks, res.task.id, 'id');
        if (idx > -1) tasks[idx] = res.task;
        this.setState({tasks}, () => {
          if (status == this.DONE && n_undone == 0) {
            toastr.success("All clear!");
          }
        });
      }
    });
  }

  add_task() {
    let {form} = this.state;
    this.setState({creating: true}, () => {
      api.post("/api/task", {title: form.new_task}, (res) => {
        let {tasks} = this.state;
        tasks.push(res.task);
        this.setState({tasks: tasks, new_showing: false, form: {}, creating: false}, () => {
          this.refs.new_task.focus()
        });
      });
    })
  }

  archive_all_done() {
    api.post("/api/task/action", {action: 'archive_complete'}, (res) => {
      if (res.archived_ids) {
        let tasks = removeItemsById(this.state.tasks, res.archived_ids, 'id');
        this.setState({tasks});
      }
    })
  }

  new_task_key_press(event) {
    if (event.charCode === 13) { // enter key pressed
      let {form} = this.state;
      event.preventDefault();
      if (form.new_task && form.new_task.length > 0) {
        this.add_task();
      }
    }
  }

  show_new_box() {
    this.setState({new_showing: true}, () => {
      this.refs.new_task.focus();
    });
  }

  task_progress() {
    let {tasks} = this.state;
    let tasks_done = 0;
    let tasks_total = tasks.length;
    tasks.forEach((task, i) => {
      if (task.done) tasks_done += 1;
    });
    return {tasks_done, tasks_total}
  }

  task_update(task, params) {
    // Toggle done on server
    params.id = task.id;
    api.post("/api/task", params, (res) => {
      if (res.task) {
        let {tasks} = this.state;
        let idx = findIndexById(tasks, res.task.id, 'id');
        if (idx > -1) tasks[idx] = res.task;
        this.setState({tasks});
      }
    });
  }

  archive(task) {
    this.task_update(task, {archived: 1});
  }

  delete_task(task) {
    api.post("/api/task/delete", {id: task.id}, (res) => {
      let {tasks} = this.state;
      tasks = removeItemsById(tasks, [task.id], 'id');
      this.setState({tasks});
    });
  }

  set_task_wip(task, is_wip) {
    util.play_audio('commit.mp3');
    this.task_update(task, {wip: is_wip ? 1 : 0});
  }

  render() {
    let {show_task_progressbar, timezone} = this.props;
    let {tasks, new_showing, form, creating} = this.state;
    let now = new Date();
    let total_mins = 24 * 60;
    let current_mins = now.getHours() * 60 + now.getMinutes();
    let {tasks_done, tasks_total} = this.task_progress();
    let new_task_entered = form.new_task && form.new_task.length > 0;
    let visible_tasks = tasks.filter((t) => { return !t.archived; });
    let _buttons = [
      <IconButton key="ref" iconClassName="material-icons" style={this.IB_ST} iconStyle={this.I_ST} onClick={this.fetch_recent.bind(this)} tooltip="Refresh">refresh</IconButton>,
      <IconButton key="add" iconClassName="material-icons" style={this.IB_ST} iconStyle={this.I_ST} onClick={this.show_new_box.bind(this)} tooltip="Add Task (T)">add</IconButton>,
      <span key="archive_all" className="pull-right" style={{marginRight: '20px'}}><IconButton key="add" iconClassName="material-icons" style={this.IB_ST} iconStyle={this.I_ST} onClick={this.archive_all_done.bind(this)} tooltip="Archive Complete">archive</IconButton></span>,
    ]
    let morning = now.getHours() <= 12;
    let exclamation = morning ? "Set the top two or three tasks for today." : "All clear!"
    let _no_tasks_cta = <span>{ exclamation } <a href="javascript:void(0)" onClick={this.show_new_box.bind(this)}>Add a task</a>.</span>
    return (
      <div className="TaskWidget" id="TaskWidget">

        <h3 onClick={this.fetch_recent.bind(this)}>Top Tasks for {util.printDateObj(new Date(), timezone, {format: "dddd, MMMM DD"})} { _buttons }</h3>
        <ProgressLine value={current_mins} total={total_mins} tooltip={util.printTime(now)} />
        { visible_tasks.length > 0 ?
          <List className="taskList">
            { visible_tasks.sort((a, b) => { return b.wip - a.wip;}).map((t) => {
              return <TaskLI key={t.id} task={t}
                        onUpdateWIP={this.set_task_wip.bind(this)}
                        onUpdateStatus={this.update_status.bind(this)}
                        onDelete={this.delete_task.bind(this)}
                        onArchive={this.archive.bind(this)} />;
            }) }
          </List>
        : (
            <div className="empty">
              { _no_tasks_cta }
            </div>
          )
        }
        <div hidden={!show_task_progressbar}>
          <ProgressLine value={tasks_done} total={tasks_total} color={this.TASK_COLOR} tooltip="Progress on today's tasks" />
        </div>

        <div hidden={!new_showing}>
          <Paper style={{padding: '10px'}}>
            <TextField name="new_task" ref="new_task" floatingLabelText="Enter new task title..." value={form.new_task || ""} onChange={this.changeHandler.bind(this, 'form', 'new_task')} onKeyPress={this.new_task_key_press.bind(this)} fullWidth />
            <AsyncActionButton
              working={creating}
              enabled={new_task_entered}
              text_disabled="Add Task"
              text_working="Adding..."
              text_enabled="Add Task"
              onClick={this.add_task.bind(this)} />
            <FlatButton label="Cancel" onClick={this.setState.bind(this, {new_showing: false})} />
          </Paper>
        </div>
      </div>
    )
  }
}
