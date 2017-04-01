var React = require('react');
import {ListItem, FontIcon, Paper, TextField,
  IconMenu, MenuItem, IconButton, Avatar,
  RaisedButton, FlatButton} from 'material-ui';
var api = require('utils/api');
import {changeHandler} from 'utils/component-utils';
var util = require('utils/util');

@changeHandler
export default class QuoteLI extends React.Component {
  static propTypes = {
    quote: React.PropTypes.object
  }

  static defaultProps = {
    quote: null
  }

  constructor(props) {
    super(props);
    let r = this.props.readable;
    this.state = {
      expanded: false
    };
  }

  toggle_expanded(q) {
    this.setState({expanded: !this.state.expanded});
  }

  render() {
    let {quote} = this.props;
    let {expanded} = this.state;
    let icon = expanded ? 'expand_less' : 'expand_more';
    let button = (
        <IconButton iconClassName="material-icons" key="expand" onClick={this.toggle_expanded.bind(this)}>{icon}</IconButton>
    );
    let subs = [quote.source];
    if (quote.location) subs.push(quote.location);
    if (quote.iso_date) subs.push(quote.iso_date);
    let sec = subs.join(' | ');
    let text = expanded ? <span style={{fontSize: "1.3em", lineHeight: "1.3em"}}>{quote.content}</span> : util.truncate(quote.content, 120);
    return (
      <ListItem primaryText={text} rightIconButton={button} secondaryText={sec} onTouchTap={this.toggle_expanded.bind(this)} />
    );
  }
}
