var React = require('react');
var util = require('utils/util');

export default class DateTime extends React.Component {
  static defaultProps = {
    ms: 0
  }

  render() {
    let {very_old, text, full_date} = util.timesince(this.props.ms);
    return (
      <span title={full_date}>{ text }</span>
      )
  }
}

