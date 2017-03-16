var React = require('react');
import { FontIcon, Dialog, RaisedButton, FlatButton, TextField, Chip } from 'material-ui';
import {changeHandler} from 'utils/component-utils';
import {clone} from 'lodash';
import {findIndexById} from 'utils/store-utils';
var ProjectLI = require('components/list_items/ProjectLI');
var api = require('utils/api');


@changeHandler
export default class ProjectViewer extends React.Component {
  static propTypes = {
    initially_show: React.PropTypes.number
  }

  static defaultProps = {
    initially_show: 3
  }
  constructor(props) {
      super(props);
      this.state = {
          form: {},
          projects: [],
          all_showing: false,
          project_dialog_open: false
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

  sorted_visible() {
    let {initially_show} = this.props;
    let {projects, all_showing} = this.state;
    let visible = projects.sort((a,b) => {
      let a_title = a.title || ""; // Handle null
      let b_title = b.title || "";
      if (b.starred == a.starred) return a_title.localeCompare(b_title);
      else return b.starred - a.starred;
    });
    if (!all_showing) return visible.slice(0, initially_show);
    else return visible;
  }

  create_project() {
    let {form} = this.state;
    let params = clone(form);
    api.post("/api/project", params, (res) => {
      if (res.project) this.setState({projects: this.state.projects.concat(res.project), project_dialog_open: false, form: {}});
    })
  }

  render_projects() {
    return this.sorted_visible().map((p) => {
        return <ProjectLI key={p.id} project={p} onProjectUpdate={this.handle_project_update.bind(this)} />
    });
  }

  render_dialog() {
    let {project_dialog_open, form} = this.state;
    let actions = [<RaisedButton primary={true} label="Create" onClick={this.create_project.bind(this)} />]
    return (
      <Dialog
        open={project_dialog_open}
        onRequestClose={this.setState.bind(this, {project_dialog_open: false})}
        title="New Project"
        actions={actions}>

        <TextField placeholder="Project title" value={form.title} onChange={this.changeHandler.bind(this, 'form', 'title')} fullWidth />
        <TextField placeholder="Project subhead" value={form.subhead} onChange={this.changeHandler.bind(this, 'form', 'subhead')} fullWidth />
        <TextField placeholder="Project URL" value={form.url1} onChange={this.changeHandler.bind(this, 'form', 'url1')} fullWidth />

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
          <div className="text-center empty">None yet, create your first!</div>
        </div>

        <RaisedButton label="New Project" onClick={this.setState.bind(this, {project_dialog_open: true})} />

      </div>
    )
  }
}
