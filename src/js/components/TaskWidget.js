var React = require('react');
import { FontIcon, IconButton, List,
  RaisedButton, TextField, Paper,
  FlatButton, IconMenu, MenuItem } from 'material-ui';
var util = require('utils/util');
var UserStore = require('stores/UserStore');
var api = require('utils/api');
var TaskLI = require('components/list_items/TaskLI');
import {findIndexById} from 'utils/store-utils';
var ProgressLine = require('components/common/ProgressLine');
var toastr = require('toastr');
import {changeHandler} from 'utils/component-utils';

@changeHandler
export default class TaskWidget extends React.Component {
  static propTypes = {
    show_task_progressbar: React.PropTypes.bool
  }

  static defaultProps = {
    show_task_progressbar: true
  }
  constructor(props) {
      super(props);
      this.state = {
          tasks: [],
          form: {},
          new_showing: false
      };
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
    api.post("/api/task", {title: form.new_task}, (res) => {
      let {tasks} = this.state;
      tasks.push(res.task);
      this.setState({tasks: tasks, new_showing: false, form: {}}, () => {
        this.refs.new_task.focus()
      });
    });
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

  set_task_wip(task, is_wip) {
    this.task_update(task, {wip: is_wip ? 1 : 0});
  }

  render() {
    let {show_task_progressbar} = this.props;
    let {tasks, new_showing, form} = this.state;
    let now = new Date();
    let total_mins = 24 * 60;
    let current_mins = now.getHours() * 60 + now.getMinutes();
    let {tasks_done, tasks_total} = this.task_progress();
    return (
      <div className="TaskWidget" id="TaskWidget">
        <div className="pull-right">
          <IconMenu iconButtonElement={<IconButton iconClassName="material-icons">more_vert</IconButton>}>
            <MenuItem leftIcon={<FontIcon className="material-icons">refresh</FontIcon>} onClick={this.fetch_recent.bind(this)}>Refresh</MenuItem>
            <MenuItem leftIcon={<FontIcon className="material-icons">add</FontIcon>} onClick={this.show_new_box.bind(this)}>Add Task</MenuItem>
          </IconMenu>
        </div>
        <div className="clearfix"/>

        <h3 onClick={this.fetch_recent.bind(this)}>Top Tasks for {util.printDateObj(new Date(), "UTC", {format: "dddd, MMMM DD"})}</h3>
        <ProgressLine value={current_mins} total={total_mins} />
        { tasks.length > 0 ?
        <List>
          { tasks.sort((a, b) => { return b.wip - a.wip;}).map((t) => {
            return <TaskLI key={t.id} task={t}
                      onUpdateWIP={this.set_task_wip.bind(this)}
                      onUpdateStatus={this.update_status.bind(this)}
                      onArchive={this.archive.bind(this)} />;
          }) }
        </List>
        : <div className="empty">All clear! <a href="javascript:void(0)" onClick={this.show_new_box.bind(this)}>Add a task</a>.</div> }
        <div hidden={!show_task_progressbar}>
          <ProgressLine value={tasks_done} total={tasks_total} color={this.TASK_COLOR} />
        </div>

        <div hidden={!new_showing}>
          <Paper style={{padding: '10px'}}>
            <TextField name="new_task" ref="new_task" floatingLabelText="Enter new task title..." value={form.new_task || ""} onChange={this.changeHandler.bind(this, 'form', 'new_task')} fullWidth />
            <RaisedButton label="Add Task" onClick={this.add_task.bind(this)} />
            <FlatButton label="Cancel" onClick={this.setState.bind(this, {new_showing: false})} />
          </Paper>
        </div>
      </div>
    )
  }
}
