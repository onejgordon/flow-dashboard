var React = require('react');
import {ListItem, FontIcon, Paper, Chip,
  IconMenu, MenuItem, IconButton, Checkbox} from 'material-ui';
var util = require('utils/util');
var DateTime = require('components/common/DateTime');
var api = require('utils/api');

export default class ProjectLI extends React.Component {
  static defaultProps = {
    project: null,
    onClick: null,
    with_progress: true,
    onProjectUpdate: null
  }

  constructor(props) {
      super(props);
      this.state = {
      };

      this.H = {
        fontSize: "16px",
        marginTop: "2px"
      }

      this.SUBHEAD = {
        fontSize: "14px",
        marginTop: "2px",
        color: '#CCC'
      }
  }

  handle_click() {
    let {project} = this.props;
    this.props.onClick(project);
  }

  goto_link(url) {
    window.open(url, "_blank");
  }

  toggle_progress() {
    let {project} = this.props;
    let progress_enabled = project.progress > -1;
    let enabled = !progress_enabled;
    let progress = enabled ? 0 : -1;
    this.set_progress(progress);
  }

  update(p, data) {
    data.id = p.id;
    api.post("/api/project", data, (res) => {
      if (this.props.onProjectUpdate) this.props.onProjectUpdate(res.project);
    });
  }

  set_progress(prg) {
    let {project} = this.props;
    this.update(project, {progress: prg});
  }

  archive() {
    let {project} = this.props;
    this.update(project, {archived: 1});
  }

  toggle_starred() {
    let {project} = this.props;
    this.update(project, {starred: project.starred ? 0 : 1});
  }

  render_progress() {
    let {with_progress, project} = this.props;
    if (!with_progress || project.progress == -1) return null;
    let BOXES = 10;
    let width_pct = parseInt(100 / BOXES) + "%";
    let boxes = [];
    for (let i = 0; i < BOXES; i++) {
      let active = project.progress >= (i+1);
      let box_percent = parseInt(100 / BOXES) * (i+1);
      boxes.push(
        <span key={i} className="progressBox_o" style={{width: width_pct}} title={`Set progress to ${box_percent}%`}>
          <span className={"progressBox_i " + (active ? "active" : "")} onClick={this.set_progress.bind(this, i+1)}></span>
        </span>
      );
    }
    return (
      <div style={{marginTop: "10px"}}>
        <div className="progressBoxes">{ boxes }</div>
      </div>
    );
  }

  render() {
    let {project} = this.props;
    let multi_links = project.urls && project.urls.length > 1;
    let title, subhead;
    let links;
    if (!project || !project.urls) return null;
    if (multi_links) {
      title = project.title || "Unknown";
      links = project.urls.map((url, i) => {
        let shortened_url = util.url_summary(url);
        return (
          <Chip
              key={i}
              labelStyle={{fontSize: "9px"}}
              onTouchTap={this.goto_link.bind(this, url)}
              style={{margin: 4, display: 'inline-block'}}>
              { shortened_url }
          </Chip>
        );
      })
    } else title = <a href={project.urls[0]} target="_blank">{ project.title || project.urls[0] }</a>
    let subheads = [<span key="dt" className="label label-default" style={{marginRight: "5px"}}><DateTime ms={project.ts_created}/></span>];
    if (project.subhead) subheads.push(project.subhead)
    subhead = <h3 style={this.SUBHEAD}>{ subheads }</h3>
    let st = {padding: "10px", marginBottom: "10px"};
    if (project.archived) st.opacity = 0.3;
    return (
      <Paper rounded={true} style={st} key={project.id}>
        <div className="row">
          <div className="col-sm-12">
            <div className="pull-right">
              <IconMenu iconButtonElement={<IconButton><FontIcon className="material-icons">more_vert</FontIcon></IconButton>}>
                <MenuItem primaryText="Toggle progress tracking" onClick={this.toggle_progress.bind(this)} />
                <MenuItem primaryText="Archive project" onClick={this.archive.bind(this)} />
              </IconMenu>
            </div>
            <h2 style={this.H}>
              <IconButton
                style={{margin: 0, padding: 0, width: '24px', height: '24px'}}
                iconStyle={{fontSize: '18px', margin: 0, padding: 0}}
                iconClassName="material-icons"
                onClick={this.toggle_starred.bind(this)}>{project.starred ? 'star' : 'star_border'}</IconButton>
                { title }
            </h2>
            { subhead }
          </div>
          <div className="col-sm-6">
            { this.render_progress() }
          </div>
          <div className="col-sm-6">
            { links }
          </div>
        </div>

      </Paper>
    )
  }
}
