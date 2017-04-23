var React = require('react');
import {ListItem, FontIcon,
  IconMenu, MenuItem, IconButton} from 'material-ui';
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
    this.state = {
      expanded: false
    };
  }

  toggle_expanded() {
    this.setState({expanded: !this.state.expanded});
  }

  link_readable() {
    let {quote} = this.props;
    api.post("/api/quote/action", {action: 'link_readable', id: quote.id});
  }

  render() {
    let {quote} = this.props;
    let {expanded} = this.state;
    let icon = expanded ? 'expand_less' : 'expand_more';
    let linked_readable = quote.readable != null;
    let src = quote.source;
    if (linked_readable) src = <span style={{color: '#2C8FFF'}}>{ src }</span>
    let subs = [src];
    if (quote.location) subs.push(<span> &middot; {quote.location}</span>);
    if (quote.iso_date) subs.push(<span> &middot; {quote.iso_date}</span>);
    let text = expanded ? <span style={{fontSize: "1.3em", lineHeight: "1.3em"}}>{quote.content}</span> : util.truncate(quote.content, 120);
    let menu = (
      <IconMenu iconButtonElement={<IconButton iconClassName="material-icons">more_vert</IconButton>}>
        <MenuItem leftIcon={<FontIcon className="material-icons">{icon}</FontIcon>} key="toggle" onClick={this.toggle_expanded.bind(this)}>Toggle expanded</MenuItem>
        <MenuItem leftIcon={<FontIcon className="material-icons">search</FontIcon>} key="lookup" onClick={this.link_readable.bind(this)}>Lookup and link readable</MenuItem>
      </IconMenu>
    );
    return (
      <ListItem primaryText={text}
                rightIconButton={menu}
                secondaryText={subs}
                onTouchTap={this.toggle_expanded.bind(this)} />
    );
  }
}
