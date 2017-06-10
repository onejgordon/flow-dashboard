var PropTypes = require('prop-types');
var React = require('react');
var util = require('utils/util');

export default class DateTime extends React.Component {
  static propTypes = {
    ms: PropTypes.number,
    prefix: PropTypes.string,
    color: PropTypes.string
  }

  static defaultProps = {
    ms: 0,
    prefix: null,
    color: null
  }

  render() {
  	let {prefix, ms, color} = this.props;
    let {very_old, text, full_date} = util.timesince(ms);
    if (prefix != null) text = prefix + ": " + text;
    let st = {};
    if (color != null) st.color = color;
    return (
      <span title={full_date} style={st}>{ text }</span>
      )
  }
}

