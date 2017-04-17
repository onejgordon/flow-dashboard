var React = require('react');
var util = require('utils/util');

export default class DateTime extends React.Component {
  static defaultProps = {
    ms: 0,
    prefix: null
  }

  render() {
  	let {prefix, ms} = this.props;
    let {very_old, text, full_date} = util.timesince(ms);
    if (prefix != null) text = prefix + ": " + text;
    return (
      <span title={full_date}>{ text }</span>
      )
  }
}

