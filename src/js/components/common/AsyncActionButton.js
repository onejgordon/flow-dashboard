var React = require('react');
import { RaisedButton, FlatButton } from 'material-ui';

export default class AsyncActionButton extends React.Component {
  static defaultProps = {
    working: false,
    enabled: false,
    onClick: null,
    text_disabled: "Saved",
    text_working: "Saving...",
    text_enabled: "Save",
    raised: true
  }

  getMessage() {
    if (this.props.working) return this.props.text_working;
    else if (this.props.enabled) return this.props.text_enabled;
    else return this.props.text_disabled;
  }

  render() {
    let {working, enabled, raised} = this.props;
    let icon;
    var message = this.getMessage();
    if (working) icon = <i className="fa fa-refresh fa-spin" style={{color: 'gray'}} />
    if (raised) return <RaisedButton disabled={working || !enabled}
                          icon={icon}
                          primary={true}
                          label={message}
                          onClick={this.props.onClick} />
    else return <FlatButton disabled={working || !enabled}
                          icon={icon}
                          primary={true}
                          label={message}
                          onClick={this.props.onClick} />
  }
}
