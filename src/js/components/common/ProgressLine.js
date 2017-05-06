var React = require('react');
import { FontIcon } from 'material-ui';

export default class ProgressLine extends React.Component {
  static defaultProps = {
    value: 0,
    total: 100,
    color: "#4FECF9",
    style: {}
  }

  render() {
    let {value, total, style} = this.props;
    let percent = total > 0 ? 100.0 * value / total : 0;
    if (percent > 100.0) percent = 100.0;
    let st = {
      width: percent.toFixed(1) + "%",
      backgroundColor: this.props.color
    }
    return <div className="dateProgressBar" style={style}><div className="progress" style={st}></div></div>
  }
}
