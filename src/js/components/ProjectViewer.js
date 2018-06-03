var React = require('react');
import { DatePicker, RaisedButton, FlatButton, TextField,
  IconMenu, MenuItem, IconButton, FontIcon } from 'material-ui';
import PropTypes from 'prop-types';
import {changeHandler} from 'utils/component-utils';
import {clone} from 'lodash';
var MobileDialog = require('components/common/MobileDialog');
var ProjectLI = require('components/list_items/ProjectLI');
var ProjectAnalysis = require('components/ProjectAnalysis');
var ProjectStore = require('stores/ProjectStore');
var util = require('utils/util');
import {browserHistory} from 'react-router';
import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
@changeHandler
export default class ProjectViewer extends React.Component {
  static propTypes = {
    due_soon_days: PropTypes.number,
    initially_show: PropTypes.number,
    projects: PropTypes.array,
    working: PropTypes.bool
  }

  static defaultProps = {
    due_soon_days: 5,
    initially_show: 3,
    working: false
  }

  constructor(props) {
    super(props);
    this.state = {
        all_showing: false,
        project_dialog_open: false,
        project_analysis: null,
        form: {},
        milestones_enabled: []
    };
  }

  static getStores() {
    return [ProjectStore];
  }

  static getPropsFromStores() {
    return ProjectStore.getState();
  }

  componentDidMount() {
    this.fetch_projects();
  }

  fetch_projects() {
    ProjectStore.fetchProjects()
  }

  due_in_days(p) {
    if (p.due != null) {
      let due = new Date(p.due);
      let due_in_days = util.dayDiff(due, new Date());
      return due_in_days;
    } else return null;
  }

  due_soon(p) {
    let {due_soon_days} = this.props;
    let due_days = this.due_in_days(p);
    if (due_days != null) {
      return due_days < due_soon_days;
    } else return false;
  }

  sorted_visible() {
    let {initially_show, projects} = this.props;
    let {all_showing} = this.state;
    let visible = projects.sort((a,b) => {
      let a_title = a.title || ""; // Handle null
      let b_title = b.title || "";
      if (b.starred == a.starred) {
        let a_due_days = this.due_in_days(a) || 10000;
        let b_due_days = this.due_in_days(b) || 10000;
        if (a_due_days == b_due_days) return a_title.localeCompare(b_title);
        else return a_due_days - b_due_days;
      }
      else return b.starred - a.starred;
    });
    if (!all_showing) return visible.slice(0, initially_show);
    else return visible;
  }

  update_project() {
    let {working} = this.props
    let {form} = this.state
    if (!working) {
      let params = clone(form);
      if (params.due) params.due = util.printDateObj(params.due);
      if (params.milestones) params.milestones = JSON.stringify(params.milestones)
      ProjectStore.updateProject(params)
      this.setState({project_dialog_open: false, form: {}, milestones_enabled: []})
    }
  }

  render_projects() {
    return this.sorted_visible().map((p) => {
        return <ProjectLI key={p.id} project={p}
          onEdit={this.open_editor.bind(this, p)}
          onShowAnalysis={this.setState.bind(this, {project_analysis: p.id})} />
    });
  }

  open_editor(p) {
    let form = {};
    if (p) {
      form = clone(p);
      if (p.urls) {
        form.url1 = p.urls[0] || '';
        form.url2 = p.urls[1] || '';
      }
      if (p.due) {
        form.due = new Date(form.due);
      }
    }
    this.setState({project_dialog_open: true, form: form, milestones_enabled: []});
  }

  dismiss_editor() {
    this.setState({project_dialog_open: false});
  }

  milestone_is_enabled(i) {
    let {milestones_enabled, form} = this.state
    return milestones_enabled.indexOf(i) > -1 || (form.milestones && form.milestones[i] && form.milestones[i].length > 0)
  }

  toggle_milestone(i) {
    let {milestones_enabled} = this.state
    util.toggleInList(milestones_enabled, i)
    this.setState({milestones_enabled})
  }

  change_milestone(i, e) {
    let {form} = this.state
    if (!form.milestones) form.milestones = Array(10).fill("")
    form.milestones[i] = e.currentTarget.value
    this.setState({form})
  }

  goto_archive() {
    browserHistory.push('/app/project/history');
  }

  render_milestone_toggles() {
    let toggles = []
    for (let i = 0; i < 10; i++) {
      let first = i == 0;
      let cls = "col-sm-1"
      if (first) cls += " col-sm-offset-2"
      let enabled = this.milestone_is_enabled(i)
      let label = `${(i+1)*10}%`
      toggles.push(<span className={cls} key={i}><a href="javascript:void(0)" onClick={this.toggle_milestone.bind(this, i)} className={"label " + (enabled ? "label-success" : "label-default")}>{ label }</a></span>)
    }
    return toggles
  }

  render_milestone_inputs() {
    let inputs = []
    let {form} = this.state
    for (let i = 0; i < 10; i++) {
      if (this.milestone_is_enabled(i)) {
        let label = `${(i+1)*10}% milestone`
        inputs.push(<TextField key={i}
                               value={form.milestones ? form.milestones[i] : ''}
                               name={`milestone${i}`}
                               onChange={this.change_milestone.bind(this, i)}
                               floatingLabelText={label}
                               fullWidth />)
      }
    }
    return inputs
  }

  render_dialog() {
    let {project_dialog_open, updating, form} = this.state;
    let editing = form.id != null;
    let actions = [
      <RaisedButton primary={true} label={editing ? "Update" : "Create"} onClick={this.update_project.bind(this)} disabled={updating} />,
      <FlatButton label="Dismiss" onClick={this.dismiss_editor.bind(this)} />
    ]
    let due_date = form.due != null ? new Date(form.due) : null;
    return (
      <MobileDialog
        open={project_dialog_open}
        onRequestClose={this.dismiss_editor.bind(this)}
        title={editing ? "Update Project" : "New Project"}
        actions={actions}>

        <TextField name="title" placeholder="Project title" value={form.title} onChange={this.changeHandler.bind(this, 'form', 'title')} fullWidth autoFocus />
        <TextField name="subhead" placeholder="Project subhead (optional)" value={form.subhead} onChange={this.changeHandler.bind(this, 'form', 'subhead')} fullWidth />

        <div className="row">
          <div className="col-sm-6">
            <TextField name="url1" placeholder="Project URL 1 (optional)" value={form.url1 || ''} onChange={this.changeHandler.bind(this, 'form', 'url1')} fullWidth />
          </div>
          <div className="col-sm-6">
            <TextField name="url2" placeholder="Project URL 2 (optional)" value={form.url2 || ''} onChange={this.changeHandler.bind(this, 'form', 'url2')} fullWidth />
          </div>
        </div>
        <DatePicker autoOk={true} floatingLabelText="Due (optional)" formatDate={util.printDateObj} value={due_date} onChange={this.changeHandlerNilVal.bind(this, 'form', 'due')} />

        <h4>Milestones</h4>

        <p className="lead">You can label key milestones in the project, then check them off as you go to update progress (from the project detail dialog)</p>

        <div className="row">
          { this.render_milestone_toggles() }
        </div>
        <div>
          { this.render_milestone_inputs() }
        </div>

      </MobileDialog>
      )
  }

  count_projects() {
    let {projects} = this.props;
    return projects.length;
  }

  render() {
    let {all_showing} = this.state;
    let {initially_show} = this.props;
    let n_projects = this.count_projects();
    let empty = n_projects == 0;
    let cropped = n_projects > initially_show;
    return (
      <div className="ProjectViewer">

        <div className="row">
          <div className="col-sm-6">
            <h3>Ongoing Projects</h3>
          </div>
          <div className="col-sm-6">
            <div className="pull-right">
              <IconMenu className="pull-right" iconButtonElement={<IconButton iconClassName="material-icons">more_vert</IconButton>}>
                <MenuItem key="gr" primaryText="Refresh" onClick={this.fetch_projects.bind(this)} leftIcon={<FontIcon className="material-icons">refresh</FontIcon>} />
                <MenuItem key="new" primaryText="New Project" onClick={this.open_editor.bind(this, null)} leftIcon={<FontIcon className="material-icons">add</FontIcon>} />
                <MenuItem key="archived" primaryText="Project History" onClick={this.goto_archive.bind(this, null)} leftIcon={<FontIcon className="material-icons">list</FontIcon>} />
              </IconMenu>
            </div>
          </div>
        </div>

        <ProjectAnalysis project={ProjectStore.getProjectById(this.state.project_analysis)} onDismiss={this.setState.bind(this, {project_analysis: null})} />

        { this.render_projects() }
        { this.render_dialog() }

        <div hidden={!cropped}>
          <div hidden={all_showing}>
            <FlatButton label={`Show all ${this.count_projects()}`} onClick={this.setState.bind(this, {all_showing: true})} />
          </div>
          <div hidden={!all_showing}>
            <FlatButton label={`Show top ${initially_show}`} onClick={this.setState.bind(this, {all_showing: false})} />
          </div>
        </div>

        <div hidden={!empty}>
          <div className="text-center empty">None yet, <a href="javascript:void(0)" onClick={this.open_editor.bind(this, null)}>create</a> your first project!</div>
        </div>

      </div>
    )
  }
}
