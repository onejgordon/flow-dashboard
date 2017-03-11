var React = require('react');
import {ListItem, FontIcon, IconButton, Checkbox} from 'material-ui';
var util = require('utils/util');
var DateTime = require('components/common/DateTime');
var api = require('utils/api');

export default class TaskLI extends React.Component {
  static defaultProps = {
    task: null,
    onUpdateStatus: null,
    onArchive: null
  }

  constructor(props) {
      super(props);
      this.state = {
      };
      this.ICONS = ['check', 'check_circle', 'archive'];
      this.NOT_DONE = 1;
      this.DONE = 2;
      this.TASK_COLOR = "#DF00FF";
  }

  render() {
    let t = this.props.task;
    let icon = this.ICONS[t.status-1];
    let click = null;
    let archive = null;
    let done = t.status == this.DONE;
    let archived = t.archived;
    if (t.status == this.NOT_DONE) click = this.props.onUpdateStatus.bind(this, t, this.DONE);
    if (done) click = this.props.onUpdateStatus.bind(this, t, this.NOT_DONE);
    if (!archived) archive = <IconButton onClick={this.props.onArchive.bind(this, t)} tooltip="Archive" iconClassName="material-icons">archive</IconButton>
    let st = { fill: this.TASK_COLOR };
    let check = <Checkbox iconStyle={st} onCheck={click} checked={done} disabled={archived} />
    let hours_until = util.hours_until(t.ts_due);
    let _icon, secondary;
    if (!done) {
      _icon = <i className="glyphicon glyphicon-time" />;
      if (hours_until < 0) _icon = <i className="glyphicon glyphicon-alert" style={{color: "#FC4750"}} />;
      else if (hours_until <= 3) _icon = <i className="glyphicon glyphicon-hourglass" style={{color: "orange"}} />;
      secondary = <span>{ _icon }&nbsp;{util.from_now(t.ts_due)}</span>
    } else {
      secondary = "Done";
    }

    return (
      <ListItem key={t.id}
        primaryText={ t.title }
        secondaryText={secondary}
        leftCheckbox={check}
        style={{fontWeight: 'normal'}}
        rightIconButton={archive} />
    );
  }
}
