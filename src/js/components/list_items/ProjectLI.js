var React = require('react');
import {ListItem, FontIcon, Paper, Chip,
  IconMenu, MenuItem, IconButton, Checkbox} from 'material-ui';
var util = require('utils/util');
var DateTime = require('components/common/DateTime');
var ProjectStore = require('stores/ProjectStore');


export default class ProjectLI extends React.Component {
  static defaultProps = {
    project: null,
    onClick: null,
    with_progress: true
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

  progress_enabled() {
    let {project} = this.props;
    return project.progress > -1;
  }

  toggle_progress() {
    let {project} = this.props;
    let enabled = !this.progress_enabled();
    let progress = enabled ? 0 : -1;
    this.set_progress(progress);
  }

  update(p, data) {
    data.id = p.id;
    ProjectStore.updateProject(data)
  }

  set_progress(prg) {
    let {project} = this.props;
    util.play_audio('complete.mp3');
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

  show_analysis() {
    this.props.onShowAnalysis();
  }

  handle_edit_click(p) {
    if (this.props.onEdit) this.props.onEdit(p);
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
    let title, subhead;
    let links;
    if (!project || !project.urls) return null;
    title = <a href="javascript:void(0)" onClick={this.show_analysis.bind(this)}>{project.title || "Unknown"}</a>
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
    let subheads = [<span key="dt" className="label label-default" style={{marginRight: "5px"}}><DateTime prefix="Created" ms={project.ts_created}/></span>];
    if (project.complete) subheads.push(<span key="complete" className="label label-success" style={{marginRight: "5px"}}>Complete</span>)
    if (project.due != null) {
      let due_date = new Date(project.due);
      let ms = due_date.getTime();
      let days_until = util.dayDiff(due_date, new Date());
      let color = days_until < 5 ? '#FC4C4C' : 'gray';
      subheads.push(<span key="due" className="label label-default" style={{marginRight: "5px"}}><DateTime color={color} prefix="Due" ms={ms}/></span>);
    }
    if (project.subhead) subheads.push(project.subhead)
    subhead = <h3 style={this.SUBHEAD}>{ subheads }</h3>
    let st = {padding: "10px", marginBottom: "10px"};
    if (project.archived) st.opacity = 0.3;
    let progress_action_label = this.progress_enabled() ? "Clear and disable progress" : "Enable progress tracking";
    return (
      <Paper rounded={true} style={st} key={project.id}>
        <div className="row">
          <div className="col-sm-12">
            <div className="pull-right">
              <IconMenu iconButtonElement={<IconButton><FontIcon className="material-icons">more_vert</FontIcon></IconButton>}>
                <MenuItem primaryText="Edit" leftIcon={<FontIcon className="material-icons">mode_edit</FontIcon>} onClick={this.handle_edit_click.bind(this, project)} />
                <MenuItem primaryText={progress_action_label} leftIcon={<FontIcon className="material-icons">view_week</FontIcon>} onClick={this.toggle_progress.bind(this)} />
                <MenuItem primaryText="Archive project" leftIcon={<FontIcon className="material-icons">archive</FontIcon>} onClick={this.archive.bind(this)} />
                <MenuItem primaryText="Visualize Project" leftIcon={<FontIcon className="material-icons">show_chart</FontIcon>} onClick={this.show_analysis.bind(this)} />
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
