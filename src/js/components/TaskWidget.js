var React = require('react');
import { IconButton, List,
  IconMenu, FontIcon, MenuItem, TextField, AutoComplete,
  FlatButton, Dialog } from 'material-ui';
import {browserHistory} from 'react-router';
var ProjectStore = require('stores/ProjectStore');
var TaskStore = require('stores/TaskStore');
var TaskActions = require('actions/TaskActions');
var util = require('utils/util');
var api = require('utils/api');
var TaskLI = require('components/list_items/TaskLI');
import {findIndexById, findItemById, removeItemsById} from 'utils/store-utils';
var TaskHUD = require('components/TaskHUD');
var ProgressLine = require('components/common/ProgressLine');
var toastr = require('toastr');
var AsyncActionButton = require('components/common/AsyncActionButton');
import connectToStores from 'alt-utils/lib/connectToStores';
import {changeHandler} from 'utils/component-utils';

@connectToStores
@changeHandler
class TaskWidget extends React.Component {
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
          project_selector_showing: false
      };
      this.I_ST = {
        fontSize: 20
      }
      this.IB_ST = {
        padding: 10,
        width: 20,
        height: 20,
        marginLeft: "20px",
        marginTop: "10px"
      }
      this.TASK_COLOR = "#DF00FF";
  }

  static getStores() {
    return [ProjectStore, TaskStore];
  }

  static getPropsFromStores() {
    return {
      ps: ProjectStore.getState(),
      dialog_open: TaskStore.getState().dialog_open
    };
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
      api.post("/api/task", {title: form.new_task, project_id: form.project_id}, (res) => {
        let {tasks} = this.state;
        tasks.push(res.task);
        TaskActions.closeTaskDialog()
        this.setState({tasks: tasks, form: {}, creating: false})
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

  goto_task_history() {
    browserHistory.push('/app/task/history');
  }

  show_task_dialog() {
    TaskActions.openTaskDialog()
  }

  dismiss_task_dialog() {
    TaskActions.closeTaskDialog()
  }

  project_input_update(searchText) {
      let {form} = this.state
      if (form.project_id) {
        delete form.project_id
        this.setState({form})
      }
  }

  project_new_request(chosenRequest, index) {
    let p
    if (index > -1) {
      p = this.props.ps.projects[index]
    } else {
      p = ProjectStore.getProjectByTitle(chosenRequest)
    }
    if (p) {
      let {form} = this.state
      form.project_id = p.id
      this.setState({form})
    }
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
        this.handle_task_changed(res.task);
      }
    });
  }

  handle_task_changed(task) {
    let {tasks} = this.state;
    let idx = findIndexById(tasks, task.id, 'id');
    if (idx > -1) tasks[idx] = task;
    this.setState({tasks});
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

  show_project_selector() {
    this.setState({project_selector_showing: true})
  }

  clear_timer_logs(task) {
    this.task_update(task, {
      timer_pending_ms: 0,
      timer_target_ms: 0,
      timer_last_start: 0,
      timer_total_ms: 0,
      timer_complete_sess: 0
    });
  }

  wip_task() {
    let {tasks} = this.state;
    let wip_tasks = tasks.filter((t) => { return t.wip });
    if (wip_tasks.length > 0) return wip_tasks[0];
  }

  render() {
    let {show_task_progressbar, timezone, dialog_open} = this.props;
    let {tasks, form, creating, project_selector_showing} = this.state;
    let now = new Date();
    let total_mins = 24 * 60;
    let current_mins = now.getHours() * 60 + now.getMinutes();
    let {tasks_done, tasks_total} = this.task_progress();
    let new_task_entered = form.new_task && form.new_task.length > 0;
    let visible_tasks = tasks.filter((t) => { return !t.archived; });
    let _buttons = [
      <IconButton key="ref" iconClassName="material-icons" style={this.IB_ST} iconStyle={this.I_ST} onClick={this.fetch_recent.bind(this)} tooltip="Refresh">refresh</IconButton>,
      <IconButton key="add" iconClassName="material-icons" style={this.IB_ST} iconStyle={this.I_ST} onClick={this.show_task_dialog.bind(this)} tooltip="Add Task (T)">add</IconButton>,
      <IconMenu key="menu" className="pull-right" iconButtonElement={<IconButton iconClassName="material-icons">more_vert</IconButton>}>
        <MenuItem key="archive" onClick={this.archive_all_done.bind(this)} leftIcon={<FontIcon className="material-icons">archive</FontIcon>} primaryText="Archive Complete" />
        <MenuItem key="task_history" onClick={this.goto_task_history.bind(this)} leftIcon={<FontIcon className="material-icons">list</FontIcon>} primaryText="Task History" />
      </IconMenu>

    ]
    let morning = now.getHours() <= 12;
    let exclamation = morning ? "Set the top two or three tasks for today." : "All clear!"
    let _no_tasks_cta = <span>{ exclamation } <a href="javascript:void(0)" onClick={this.show_task_dialog.bind(this)}>Add a task</a>.</span>
    let _project_section
    if (project_selector_showing) _project_section = (<AutoComplete
                          hintText="Project (optional)"
                          dataSource={this.props.ps.projects}
                          filter={(searchText, key) => searchText !== '' && key.toLowerCase().indexOf(searchText.toLowerCase()) !== -1}
                          onUpdateInput={this.project_input_update.bind(this)}
                          onNewRequest={this.project_new_request.bind(this)}
                          openOnFocus={true}
                          dataSourceConfig={{text: 'title', value: 'id'}}
                          floatingLabelText="Project"
                          fullWidth={true} />)
    else _project_section = (
      <div style={{marginTop: "20px"}}>
        <IconButton iconClassName="material-icons" onClick={this.show_project_selector.bind(this)} tooltip="Link with Project">layers</IconButton>
      </div>
    )

    let dialog_actions = [
      <AsyncActionButton
                working={creating}
                enabled={new_task_entered}
                text_disabled="Add Task"
                text_working="Adding..."
                text_enabled="Add Task"
                onClick={this.add_task.bind(this)} />,
      <FlatButton label="Cancel" onClick={this.dismiss_task_dialog.bind(this)} />
    ]
    if (form.project_id) {
      let p = findItemById(this.props.ps.projects, form.project_id, 'id');
      if (p) dialog_actions.splice(0, 0, <span className="transparent" style={{marginRight: "15px"}}>Linking with: { p.title }</span>)
    }
    let wip_task = this.wip_task();
    return (
      <div className="TaskWidget" id="TaskWidget">

        <h3 onClick={this.fetch_recent.bind(this)}>Top Tasks for {util.printDateObj(new Date(), timezone, {format: "dddd, MMMM DD"})} { _buttons }</h3>
        <ProgressLine value={current_mins} total={total_mins} tooltip={util.printTime(now)} />
        { visible_tasks.length > 0 ?
          <List className="taskList">
            { visible_tasks.sort((a, b) => { return b.wip - a.wip;}).map((t) => {
              return <TaskLI key={t.id} task={t}
                        wip_enabled={!wip_task}
                        onUpdateWIP={this.set_task_wip.bind(this)}
                        onUpdateStatus={this.update_status.bind(this)}
                        onClearTimerLogs={this.clear_timer_logs.bind(this)}
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

        <Dialog title="New Task"
                open={dialog_open}
                onRequestClose={this.dismiss_task_dialog.bind(this)}
                actions={dialog_actions}>
          <div style={{padding: '10px'}}>
            <div className="row">
              <div className="col-sm-7">
                <TextField name="new_task" ref="new_task" floatingLabelText="Enter new task title..."
                           value={form.new_task || ""}
                           onChange={this.changeHandler.bind(this, 'form', 'new_task')}
                           onKeyPress={this.new_task_key_press.bind(this)} fullWidth autoFocus />
              </div>
              <div className="col-sm-5">
                { _project_section }
              </div>
            </div>
          </div>
        </Dialog>

        <TaskHUD task={wip_task} onTaskUpdate={this.handle_task_changed.bind(this)} />
      </div>
    )
  }
}

export default TaskWidget