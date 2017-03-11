var React = require('react');
import {ListItem, FontIcon, Paper, Chip,
  IconMenu, MenuItem, IconButton, Avatar} from 'material-ui';
var util = require('utils/util');
var DateTime = require('components/common/DateTime');
var api = require('utils/api');

export default class ReadableLI extends React.Component {
  static defaultProps = {
    readable: null,
    onClick: null,
    onProjectUpdate: null
  }

  constructor(props) {
    super(props);
    this.state = {
    };
    this.TYPES = ["Article", "Book"];
    this.FAVORITE_ENABLED_SOURCES = ['pocket'];
    this.READ_ENABLED_SOURCES = ['pocket'];
  }


  update_readable(r, params) {
    params.id = r.id;
    console.log(params)
    api.post("/api/readable", params, (res) => {
      this.props.onUpdate(res.readable);
    });
  }

  delete_readable(r) {
    let id = r.id;
    api.post("/api/readable/delete", {id: id}, (res) => {
      this.props.onDelete(id);
    });
  }

  goto_url(url) {
    window.open(url, "_blank");
  }

  get_link_url(r) {
    return r.source_url || r.url;
  }

  render() {
    let {readable} = this.props;
    let type = this.TYPES[readable.type - 1];
    let subhead = [type, readable.read ? 'Read' : 'Unread', readable.source];
    if (readable.author) subhead.push(readable.author);
    if (readable.favorite) subhead.push("Favorite");
    let mis = [];
    let source = readable.source;
    if (!readable.read && this.READ_ENABLED_SOURCES.indexOf(source) > -1) mis.push(<MenuItem leftIcon={<FontIcon className="material-icons">remove_red_eye</FontIcon>} key="mr" onClick={this.update_readable.bind(this, readable, {read: 1})}>Mark Read</MenuItem>);
    if (!readable.favorite) mis.push(<MenuItem leftIcon={<FontIcon className="material-icons">star</FontIcon>} key="mf" onClick={this.update_readable.bind(this, readable, {favorite: 1})}>Favorite</MenuItem>);
    mis.push(<MenuItem leftIcon={<FontIcon className="material-icons">delete</FontIcon>} key="del" onClick={this.delete_readable.bind(this, readable)}>Delete</MenuItem>);
    let menu = (
      <IconMenu iconButtonElement={<IconButton iconClassName="material-icons">more_vert</IconButton>}>
        { mis }
      </IconMenu>
    );
    let av_st = {};
    if (readable.favorite) av_st.border = '2px solid #F9EB97';
    let avatar = <Avatar src={readable.image_url} style={av_st} />
    return (
        <ListItem key={readable.id}
          primaryText={ readable.title }
          secondaryText={ subhead.join(' | ') }
          onTouchTap={this.goto_url.bind(this, this.get_link_url(readable))}
          rightIconButton={menu}
          leftAvatar={avatar} />
    );
  }
}
