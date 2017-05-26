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
    checkbox_enabled: React.PropTypes.bool,
    delete_enabled: React.PropTypes.bool,
    wip_enabled: React.PropTypes.bool,
    archive_enabled: React.PropTypes.bool,
    absolute_date: React.PropTypes.bool
  }

  static defaultProps = {
    task: null,
    onUpdateStatus: null,
    onArchive: null,
    onDelete: null,
    onUpdateWIP: null,
    checkbox_enabled: true,
    delete_enabled: true,
    wip_enabled: true,
    archive_enabled: true,
    absolute_date: false
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
    let {onDelete, onArchive, onUpdateStatus, checkbox_enabled, wip_enabled,
      archive_enabled, delete_enabled, absolute_date} = this.props;
    let click = null;
    let menu = [];
    let done = t.status == this.DONE;
    let archived = t.archived;
    if (!done && !archived && wip_enabled) {
      if (t.wip) menu.push({icon: 'stop', click: this.set_wip.bind(this, false), label: 'Clear WIP'});
      else menu.push({icon: 'play_for_work', click: this.set_wip.bind(this, true), label: 'On It (Set as WIP)'});
    }
    if (!done && onDelete != null && delete_enabled) menu.push({icon: 'delete', click: onDelete.bind(this, t), label: 'Delete'})
    if (!archived && onArchive != null && archive_enabled) menu.push({icon: 'archive', click: onArchive.bind(this, t), label: 'Archive'});
    if (t.status == this.NOT_DONE && onUpdateStatus != null && checkbox_enabled) click = onUpdateStatus.bind(this, t, this.DONE);
    if (done && onUpdateStatus != null) click = onUpdateStatus.bind(this, t, this.NOT_DONE);
    let st = { fill: this.TASK_COLOR };
    let check = <Checkbox iconStyle={st} onCheck={click} checked={done} disabled={archived || !checkbox_enabled} />
    let hours_until = util.hours_until(t.ts_due);
    let _icon, secondary;
    if (done) secondary = "Done";
    else if (archived) secondary = "Archived";
    else {
      _icon = <i className="glyphicon glyphicon-time" />;
      if (hours_until < 0) _icon = <i className="glyphicon glyphicon-alert" style={{color: "#FC4750"}} />;
      else if (hours_until <= 3) _icon = <i className="glyphicon glyphicon-hourglass" style={{color: "orange"}} />;
      secondary = <span>{ _icon }&nbsp;{ absolute_date ? util.printDate(t.ts_due) : util.from_now(t.ts_due)}</span>
    }
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
    if (t.wip) primaryText = <div className="wip">[ WIP ] {t.title}</div>;
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
