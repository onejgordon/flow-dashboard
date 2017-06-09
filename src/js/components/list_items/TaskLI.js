var React = require('react');
import {ListItem, FontIcon, IconButton,
  IconMenu, MenuItem, Checkbox} from 'material-ui';
var util = require('utils/util');
var toastr = require('toastr')

export default class TaskLI extends React.Component {
  static propTypes = {
    onUpdateStatus: React.PropTypes.func,
    onArchive: React.PropTypes.func,
    onEdit: React.PropTypes.func,
    onDelete: React.PropTypes.func,
    onUpdateWIP: React.PropTypes.func,
    onClearTimerLogs: React.PropTypes.func,
    checkbox_enabled: React.PropTypes.bool,
    delete_enabled: React.PropTypes.bool,
    edit_enabled: React.PropTypes.bool,
    wip_enabled: React.PropTypes.bool,
    archive_enabled: React.PropTypes.bool,
    absolute_date: React.PropTypes.bool,
  }

  static defaultProps = {
    task: null,
    onUpdateStatus: null,
    onArchive: null,
    onEdit: null,
    onDelete: null,
    onUpdateWIP: null,
    onClearTimerLogs: null,
    checkbox_enabled: true,
    delete_enabled: true,
    edit_enabled: true,
    wip_enabled: true,
    archive_enabled: true,
    absolute_date: false,
  }

  constructor(props) {
      super(props);
      this.state = {
      };
      this.NOT_DONE = 1;
      this.DONE = 2;
      this.TASK_COLOR = "#DF00FF";
  }

  set_wip(is_wip) {
    this.props.onUpdateWIP(this.props.task, is_wip);
  }

  attempt_mark_done(t) {
    let {onUpdateStatus} = this.props
    let can_mark_done = t.timer_last_start + t.timer_pending_ms == 0
    if (can_mark_done) onUpdateStatus(t, this.DONE)
    else toastr.info("Exit timer before completing this task")
  }

  render_secondary() {
    let {absolute_date} = this.props;
    let t = this.props.task;
    let hours_until = util.hours_until(t.ts_due);
    let _icon
    let secondary = [];
    let done = t.status == this.DONE;
    let date = (absolute_date || done || t.archived) ? util.printDate(t.ts_due) : util.from_now(t.ts_due)
    if (done) secondary.push(<span key="done">Done</span>)
    if (t.archived) secondary.push(<span key="arch">Archived</span>)
    if (!done && !t.archived) {
      _icon = <i className="glyphicon glyphicon-time" />;
      if (hours_until < 0) _icon = <i className="glyphicon glyphicon-alert" style={{color: "#FC4750"}} />;
      else if (hours_until <= 3) _icon = <i className="glyphicon glyphicon-hourglass" style={{color: "orange"}} />;
    }
    secondary.push(<span key="due">{ _icon }&nbsp;{date}</span>)
    if (t.timer_total_ms > 0) secondary.push(<span key="timed" className="timed">{` (${util.secsToDuration(t.timer_total_ms/1000, {no_seconds: true})} logged)`}</span>)
    if (t.project != null) secondary.push(<span key="proj" className="project-indicator">{ t.project.title }</span>)
    return <div className="task-secondary">{secondary}</div>
  }

  render() {
    let t = this.props.task;
    let {onDelete, onArchive, onEdit, onUpdateStatus, onClearTimerLogs,
          checkbox_enabled, edit_enabled, wip_enabled,
          archive_enabled, delete_enabled} = this.props;
    let click = null;
    let menu = [];
    let done = t.status == this.DONE;
    let archived = t.archived;
    if (!archived && edit_enabled && onEdit != null) menu.push({icon: 'edit', click: onEdit.bind(this, t), label: 'Edit'});
    if (!archived && onArchive != null && archive_enabled) menu.push({icon: 'archive', click: onArchive.bind(this, t), label: 'Archive'});
    if (t.status == this.NOT_DONE && onUpdateStatus != null && checkbox_enabled) click = this.attempt_mark_done.bind(this, t)
    if (done && onUpdateStatus != null) click = onUpdateStatus.bind(this, t, this.NOT_DONE);
    if (!done && onDelete != null && delete_enabled) menu.push({icon: 'delete', click: onDelete.bind(this, t), label: 'Delete'})
    if (!done && !archived && !t.wip && wip_enabled) {
      menu.splice(0, 0, {icon: 'play_for_work', click: this.set_wip.bind(this, true), label: 'On It (Start Working)'});
    }
    if (t.timer_total_ms > 0 && onClearTimerLogs != null) menu.push({icon: 'delete_sweep', click: onClearTimerLogs.bind(this, t), label: 'Clear Timer Logs'});
    let st = { fill: this.TASK_COLOR };
    let check = <Checkbox iconStyle={st} onCheck={click} checked={done} disabled={archived || !checkbox_enabled} />
    let rightIcon;
    if (menu.length == 1) {
      let mi = menu[0];
      rightIcon = <IconButton tooltip={mi.label} onClick={mi.click} iconClassName="material-icons">{mi.icon}</IconButton>
    } else if (menu.length > 1) {
      rightIcon = (
        <IconMenu iconButtonElement={<IconButton iconClassName="material-icons">more_vert</IconButton>}>
          { menu.map((mi, i) => {
            return <MenuItem key={i} leftIcon={<FontIcon className="material-icons">{mi.icon}</FontIcon>} onClick={mi.click}>{mi.label}</MenuItem>
          }) }
        </IconMenu>
      );
    }
    let primaryText;
    if (t.wip) primaryText = <div className="wip">{t.title}</div>;
    else {
      let cls = t.done ? 'task done' : 'task';
      primaryText = <div className={cls}>{t.title}</div>;
    }
    return (
      <ListItem key={t.id}
        primaryText={ primaryText }
        secondaryText={this.render_secondary()}
        leftCheckbox={check}
        style={{fontWeight: 'normal'}}
        rightIconButton={rightIcon} />
    );
  }
}
