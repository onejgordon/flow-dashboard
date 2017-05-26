var React = require('react');
import { FontIcon } from 'material-ui';
var util = require('utils/util');
var ReactTooltip = require('react-tooltip');

export default class ProgressLine extends React.Component {
  static propTypes = {
    value: React.PropTypes.number,
    total: React.PropTypes.number,
    color: React.PropTypes.string,
    min_color: React.PropTypes.string,
    tooltip: React.PropTypes.string,
    style: React.PropTypes.object,
  }

  static defaultProps = {
    value: 0,
    total: 100,
    color: "#4FECF9",
    min_color: null,  // If defined, render color as per progress between min_color - color
    style: {},
    tooltip: null
  }

  componentDidMount() {
    if (this.props.tooltip) ReactTooltip.rebuild();
  }

  render() {
    let {value, total, style, tooltip, color, min_color} = this.props;
    let percent = total > 0 ? 100.0 * value / total : 0;
    if (percent > 100.0) percent = 100.0;
    let progress_gradient = min_color != null;
    let bgColor;
    if (progress_gradient) {
      bgColor = '#' + util.colorInterpolate({
        color1: min_color.slice(1),
        color2: color.slice(1),
        ratio: percent / 100.0
      })
    } else bgColor = color;
    let st = {
      width: percent.toFixed(1) + "%",
      backgroundColor: bgColor
    }
    return (
      <div data-tip={tooltip} className="progressBarHolder">
        <div className="progressBar" style={style}><div className="progress" style={st}></div></div>
      </div>
    );
  }
}
