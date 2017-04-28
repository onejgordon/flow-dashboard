var React = require('react');
import { DatePicker, Dialog, RaisedButton, FlatButton, TextField } from 'material-ui';
import {changeHandler} from 'utils/component-utils';
import {clone} from 'lodash';
import {findIndexById} from 'utils/store-utils';
var ProjectLI = require('components/list_items/ProjectLI');
var api = require('utils/api');
var ProjectAnalysis = require('components/ProjectAnalysis');
var util = require('utils/util');

@changeHandler
export default class ProjectViewer extends React.Component {
  static propTypes = {
    due_soon_days: React.PropTypes.number,
    initially_show: React.PropTypes.number
  }

  static defaultProps = {
    due_soon_days: 5,
    initially_show: 3
  }
  constructor(props) {
      super(props);
      this.state = {
          form: {},
          projects: [],
          all_showing: false,
          project_dialog_open: false,
          project_analysis: null,
          working: false
      };
  }

  componentDidMount() {
      api.get("/api/project/active", {}, (res) => {
        this.setState({projects: res.projects})
      });
  }

  handle_project_update(p) {
    let {projects} = this.state;
    let idx = findIndexById(projects, p.id, 'id');
    if (idx > -1) projects[idx] = p;
    this.setState({projects});
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
    let {initially_show} = this.props;
    let {projects, all_showing} = this.state;
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
    // if (!all_showing) return visible.filter((prj) => {
    //   return prj.starred || util.due_soon(prj);
    // })
    else return visible;
  }

  update_project() {
    let {form} = this.state;
    let params = clone(form);
    if (params.due) params.due = util.printDateObj(params.due);
    this.setState({updating: true}, () => {
      api.post("/api/project", params, (res) => {
        if (res.project) {
          let projects = this.state.projects;
          let idx = findIndexById(projects, res.project.id, 'id');
          if (idx > -1) projects[idx] = res.project;
          else projects.push(res.project);
          this.setState({projects: projects, project_dialog_open: false, form: {}, updating: false});
        }
      })
    });
  }

  render_projects() {
    return this.sorted_visible().map((p) => {
        return <ProjectLI key={p.id} project={p}
          onProjectUpdate={this.handle_project_update.bind(this)}
          onEdit={this.open_editor.bind(this, p)}
          onShowAnalysis={this.setState.bind(this, {project_analysis: p})} />
    });
  }

  open_editor(p) {
    let form = clone(p);
    if (p.urls) {
      form.url1 = p.urls[0] || '';
      form.url2 = p.urls[1] || '';
    }
    if (p.due) {
      form.due = new Date(form.due);
    }
    this.setState({project_dialog_open: true, form: form});
  }

  render_dialog() {
    let {project_dialog_open, form, updating} = this.state;
    let editing = form.id != null;
    let actions = [<RaisedButton primary={true} label={editing ? "Update" : "Create"} onClick={this.update_project.bind(this)} disabled={updating} />]
    let due_date = form.due != null ? new Date(form.due) : null;
    return (
      <Dialog
        open={project_dialog_open}
        onRequestClose={this.setState.bind(this, {project_dialog_open: false})}
        title={editing ? "Update Project" : "New Project"}
        actions={actions}>

        <TextField name="title" placeholder="Project title" value={form.title} onChange={this.changeHandler.bind(this, 'form', 'title')} fullWidth />
        <TextField name="subhead" placeholder="Project subhead (optional)" value={form.subhead} onChange={this.changeHandler.bind(this, 'form', 'subhead')} fullWidth />
        <TextField name="url1" placeholder="Project URL 1 (optional)" value={form.url1 || ''} onChange={this.changeHandler.bind(this, 'form', 'url1')} fullWidth />
        <TextField name="url2" placeholder="Project URL 2 (optional)" value={form.url2 || ''} onChange={this.changeHandler.bind(this, 'form', 'url2')} fullWidth />
        <DatePicker autoOk={true} floatingLabelText="Due (optional)" formatDate={util.printDateObj} value={due_date} onChange={this.changeHandlerNilVal.bind(this, 'form', 'due')} />

      </Dialog>
      )
  }

  count_projects() {
    let {projects} = this.state;
    return projects.length;
  }

  render() {
    let {all_showing, projects} = this.state;
    let {initially_show} = this.props;
    let n_projects = this.count_projects();
    let empty = n_projects == 0;
    let cropped = n_projects > initially_show;
    return (
      <div className="ProjectViewer">
        <h3>Ongoing Projects</h3>

        <ProjectAnalysis project={this.state.project_analysis} onDismiss={this.setState.bind(this, {project_analysis: false})} />

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
          <div className="text-center empty">None yet, <a href="javascript:void(0)" onClick={this.setState.bind(this, {project_dialog_open: true})}>create your first</a>!</div>
        </div>

        <div hidden={empty}>
          <RaisedButton label="New Project" onClick={this.setState.bind(this, {project_dialog_open: true})} />
        </div>

      </div>
    )
  }
}
