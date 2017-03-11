var React = require('react');
import { FontIcon, Dialog, RaisedButton, FlatButton, TextField, Chip } from 'material-ui';
import connectToStores from 'alt-utils/lib/connectToStores';
import {changeHandler} from 'utils/component-utils';
import {findIndexById} from 'utils/store-utils';
var ProjectLI = require('components/list_items/ProjectLI');
var api = require('utils/api');


@changeHandler
export default class ProjectViewer extends React.Component {
  static defaultProps = {
    initially_show: 3
  }
  constructor(props) {
      super(props);
      this.state = {
          form: {},
          projects: [],
          all_showing: false
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
      return b.starred - a.starred;
    });
    if (!all_showing) return visible.slice(0, initially_show);
    else return visible;
  }

  render_projects() {
    return this.sorted_visible().map((p) => {
        return <ProjectLI key={p.id} project={p} onProjectUpdate={this.handle_project_update.bind(this)} />
    });
  }

  count_projects() {
    let {projects} = this.state;
    return projects.length;
  }

  render() {
    let {form, all_showing} = this.state;
    let {initially_show} = this.props;
    return (
      <div className="ProjectViewer">
        <h3>Ongoing Projects</h3>
        { this.render_projects() }

        <div hidden={all_showing}>
          <FlatButton label={`Show all ${this.count_projects()}`} onClick={this.setState.bind(this, {all_showing: true})} />
        </div>
        <div hidden={!all_showing}>
          <FlatButton label={`Show top ${initially_show}`} onClick={this.setState.bind(this, {all_showing: false})} />
        </div>
      </div>
    )
  }
}
