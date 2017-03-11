var React = require('react');
import { FontIcon } from 'material-ui';

export default class ProgressLine extends React.Component {
  static defaultProps = {
    value: 0,
    total: 100,
    color: "#4FECF9"
  }

  render() {
    let {value, total} = this.props;
    let percent = total > 0 ? 100.0 * value / total : 0;
    let st = {
      width: percent.toFixed(1) + "%",
      backgroundColor: this.props.color
    }
    return <div className="dateProgressBar"><div className="progress" style={st}></div></div>
  }
}
