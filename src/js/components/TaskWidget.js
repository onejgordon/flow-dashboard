var React = require('react');
import { IconButton, List,
  IconMenu, FontIcon, MenuItem, TextField, AutoComplete,
  FlatButton, Dialog } from 'material-ui';
import PropTypes from 'prop-types';
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
import {clone, merge} from 'lodash'
var AsyncActionButton = require('components/common/AsyncActionButton');
import connectToStores from 'alt-utils/lib/connectToStores';
import {changeHandler} from 'utils/component-utils';

@connectToStores
@changeHandler
class TaskWidget extends React.Component {
  static propTypes = {
    timezone: PropTypes.string,
    show_task_progressbar: PropTypes.bool
  }

  static defaultProps = {
    timezone: "UTC",
    show_task_progressbar: true,
    working: false
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
        marginLeft: "10px",
        marginTop: "10px"
      }
      this.TASK_COLOR = "#DF00FF"
      this.START_TIMER_ON_WIP = true
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

  task_update(task, params) {
    // Toggle done on server
    params.id = task.id;
    this.setState({working: true}, () => {
      api.post("/api/task", params, (res) => {
        if (res.task) {
          this.handle_task_changed(res.task, {form: {}, working: false, project_selector_showing: false});
          TaskActions.closeTaskDialog()
        }
      });
    })
  }

  save_task() {
    let {form} = this.state;
    this.task_update(form, {title: form.title, project_id: form.project_id})
  }

  handle_task_changed(task, additional_updates) {
    let {tasks} = this.state
    util.updateByKey(task, tasks, 'id')
    let st = {tasks: tasks}
    if (additional_updates) merge(st, additional_updates)
    this.setState(st)
  }

  archive_all_done() {
    api.post("/api/task/action", {action: 'archive_complete'}, (res) => {
      if (res.archived_ids) {
        let tasks = removeItemsById(this.state.tasks, res.archived_ids, 'id');
        this.setState({tasks});
      }
    })
  }

  task_title_key_press(event) {
    if (event.charCode === 13) { // enter key pressed
      let {form} = this.state;
      event.preventDefault();
      if (form.title && form.title.length > 0) {
        this.save_task();
      }
    }
  }

  goto_task_history() {
    browserHistory.push('/app/task/history');
  }

  show_task_dialog(t) {
    TaskActions.openTaskDialog()
    let st = {form: {}}
    if (t) st.form = clone(t)
    this.setState(st)
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

  edit_task(task) {
    this.show_task_dialog(task)
  }

  editing_task() {
    let {form}  = this.state
    return form.id != null;
  }

  set_task_wip(task, is_wip) {
    util.play_audio('commit.mp3');
    let params = {wip: is_wip ? 1 : 0}
    if (is_wip && this.START_TIMER_ON_WIP) params.timer_last_start = util.nowTimestamp()
    this.task_update(task, params);
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
    let {tasks, form, working, project_selector_showing} = this.state;
    let now = new Date();
    let total_mins = 24 * 60;
    let current_mins = now.getHours() * 60 + now.getMinutes();
    let {tasks_done, tasks_total} = this.task_progress();
    let can_update = form.title && form.title.length > 0;
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
    let editing = this.editing_task()
    let dialog_actions = [
      <AsyncActionButton
                working={working}
                enabled={can_update}
                text_disabled={editing ? "Update Task" : "Add Task"}
                text_working={editing ? "Updating..." : "Adding..."}
                text_enabled={editing ? "Update Task" : "Add Task"}
                onClick={this.save_task.bind(this)} />,
      <FlatButton label="Cancel" onClick={this.dismiss_task_dialog.bind(this)} />
    ]
    if (form.project_id) {
      let p = findItemById(this.props.ps.projects, form.project_id, 'id');
      if (p) dialog_actions.splice(0, 0, <span className="transparent" style={{marginRight: "15px"}}>Linking with: { p.title }</span>)
    }
    let wip_task = this.wip_task();
    return (
      <div className="TaskWidget" id="TaskWidget">

        <h3>Top Tasks for {util.printDateObj(new Date(), timezone, {format: "dddd, MMMM DD"})} { _buttons }</h3>
        <ProgressLine value={current_mins} total={total_mins} tooltip={util.printTime(now)} />
        { visible_tasks.length > 0 ?
          <List className="taskList">
            { visible_tasks.map((t) => {
              return <TaskLI key={t.id} task={t}
                        wip_enabled={!wip_task}
                        onUpdateWIP={this.set_task_wip.bind(this)}
                        onUpdateStatus={this.update_status.bind(this)}
                        onClearTimerLogs={this.clear_timer_logs.bind(this)}
                        onDelete={this.delete_task.bind(this)}
                        onEdit={this.edit_task.bind(this)}
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

        <Dialog title={editing ? "Edit Task" : "New Task"}
                open={dialog_open}
                onRequestClose={this.dismiss_task_dialog.bind(this)}
                actions={dialog_actions}>
          <div style={{padding: '10px'}}>
            <div className="row">
              <div className="col-sm-7">
                <TextField name="title" ref="title" floatingLabelText="Enter task title..."
                           value={form.title || ""}
                           onChange={this.changeHandler.bind(this, 'form', 'title')}
                           onKeyPress={this.task_title_key_press.bind(this)} fullWidth autoFocus />
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