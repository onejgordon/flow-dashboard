var React = require('react');
import {ListItem, FontIcon, IconButton,
  IconMenu, MenuItem, Checkbox} from 'material-ui';
var util = require('utils/util');

export default class TaskLI extends React.Component {
  static propTypes = {
    onUpdateStatus: React.PropTypes.func,
    onArchive: React.PropTypes.func,
    onDelete: React.PropTypes.func,
    onUpdateWIP: React.PropTypes.func,
    onClearTimerLogs: React.PropTypes.func,
    canSetWIP: React.PropTypes.bool
  }

  static defaultProps = {
    task: null,
    onUpdateStatus: null,
    onArchive: null,
    onUpdateWIP: null,
    onClearTimerLogs: null,
    canSetWIP: true
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

  render() {
    let t = this.props.task;
    let {canSetWIP} = this.props;
    let click = null;
    let menu = [];
    let done = t.status == this.DONE;
    let archived = t.archived;
    if (!done && !archived && !t.wip && canSetWIP) {
      menu.push({icon: 'play_for_work', click: this.set_wip.bind(this, true), label: 'On It (Start Working)'});
    }
    if (!done) menu.push({icon: 'delete', click: this.props.onDelete.bind(this, t), label: 'Delete'})
    if (!archived) menu.push({icon: 'archive', click: this.props.onArchive.bind(this, t), label: 'Archive'});
    if (t.timer_total_ms > 0) menu.push({icon: 'delete_sweep', click: this.props.onClearTimerLogs.bind(this, t), label: 'Clear Timer Logs'});
    if (t.status == this.NOT_DONE) click = this.props.onUpdateStatus.bind(this, t, this.DONE);
    if (done) click = this.props.onUpdateStatus.bind(this, t, this.NOT_DONE);
    let st = { fill: this.TASK_COLOR };
    let check = <Checkbox iconStyle={st} onCheck={click} checked={done} disabled={archived} />
    let hours_until = util.hours_until(t.ts_due);
    let _icon, secondary;
    if (done) secondary = [<span>Done</span>]
    else if (archived) secondary = [<span>Archived</span>];
    else {
      _icon = <i className="glyphicon glyphicon-time" />;
      if (hours_until < 0) _icon = <i className="glyphicon glyphicon-alert" style={{color: "#FC4750"}} />;
      else if (hours_until <= 3) _icon = <i className="glyphicon glyphicon-hourglass" style={{color: "orange"}} />;
      secondary = [<span key="due">{ _icon }&nbsp;{util.from_now(t.ts_due)}</span>]
    }
    if (t.timer_total_ms > 0) secondary.push(<span key="timed">{` (${util.secsToDuration(t.timer_total_ms/1000, {no_seconds: true})} logged)`}</span>)
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
        secondaryText={secondary}
        leftCheckbox={check}
        style={{fontWeight: 'normal'}}
        rightIconButton={rightIcon} />
    );
  }
}
