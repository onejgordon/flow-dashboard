var React = require('react');
import {ListItem, FontIcon, Paper, TextField,
  IconMenu, MenuItem, IconButton, Avatar,
  RaisedButton, FlatButton} from 'material-ui';
var api = require('utils/api');
import {changeHandler} from 'utils/component-utils';
var util = require('utils/util');

@changeHandler
export default class ReadableLI extends React.Component {
  static propTypes = {
    readable: React.PropTypes.object
  }

  static defaultProps = {
    readable: null,
    onClick: null,
    onProjectUpdate: null
  }

  constructor(props) {
    super(props);
    let r = this.props.readable;
    this.state = {
      notes_visible: false,
      form: {
        notes: r ? r.notes || '' : ''
      }
    };
    this.TYPES = ["Article", "Book", "Paper"];
    this.FAV_COLOR = '#F9EB97';
  }

  update_readable(r, params) {
    params.id = r.id;
    api.post("/api/readable", params, (res) => {
      this.props.onUpdate(res.readable);
    });
  }

  save_notes() {
    let {readable} = this.props;
    let {form} = this.state;
    let params = {
      notes: form.notes
    }
    this.update_readable(readable, params);
    this.setState({notes_visible: false});
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

  handle_item_click(r) {
    if (this.props.onItemClick != null) this.props.onItemClick(r);
    else {
      this.goto_url.bind(this, this.get_link_url(readable))
    }
  }

  render() {
    let {readable} = this.props;
    let {notes_visible, form} = this.state;
    let type = this.TYPES[readable.type - 1];
    let subhead = [<span key="type" className="sh">{type}</span>, <span key="read" className="sh">{readable.read ? 'Read' : 'Unread'}</span>];
    let _notes;
    if (readable.author) subhead.push(<span key="author" className="sh">{readable.author}</span>);
    if (readable.favorite) subhead.push(<span key="fav" className="sh" style={{color: this.FAV_COLOR}}>Favorite</span>);
    if (readable.notes) subhead.push(<span key="notes" className="sh" style={{color: '#F6335F'}}>Has Notes</span>);
    let mis = [];
    if (!readable.read) mis.push(<MenuItem leftIcon={<FontIcon className="material-icons">remove_red_eye</FontIcon>} key="mr" onClick={this.update_readable.bind(this, readable, {read: 1})}>Mark Read</MenuItem>);
    if (!readable.favorite) mis.push(<MenuItem leftIcon={<FontIcon className="material-icons">star</FontIcon>} key="mf" onClick={this.update_readable.bind(this, readable, {favorite: 1})}>Favorite</MenuItem>);
    mis.push(<MenuItem leftIcon={<FontIcon className="material-icons">delete</FontIcon>} key="del" onClick={this.delete_readable.bind(this, readable)}>Delete</MenuItem>);
    mis.push(<MenuItem leftIcon={<FontIcon className="material-icons">mode_edit</FontIcon>} key="notes" onClick={this.setState.bind(this, {notes_visible: true})}>Edit Notes</MenuItem>);
    let menu = (
      <IconMenu iconButtonElement={<IconButton iconClassName="material-icons">more_vert</IconButton>}>
        { mis }
      </IconMenu>
    );
    let av_st = {};
    if (readable.favorite) av_st.border = `2px solid ${this.FAV_COLOR}`;
    let has_image = readable.image_url != null;
    if (!has_image) av_st.backgroundColor = util.stringToColor(readable.title);
    let avatar_content = has_image ? null : readable.title[0];
    let avatar = <Avatar src={readable.image_url} style={av_st}>{ avatar_content }</Avatar>
    if (notes_visible) _notes = (
        <Paper style={{padding: "10px"}}>
          <TextField floatingLabelText="Notes" name="notes" value={form.notes || ""} onChange={this.changeHandler.bind(this, 'form', 'notes')} multiLine={true} fullWidth />
          <RaisedButton primary={true} label="Save Notes" onClick={this.save_notes.bind(this)} />
          <FlatButton label="Cancel" onClick={this.setState.bind(this, {notes_visible: false})} />
        </Paper>
      )
    return (
      <div>
        <ListItem key={readable.id}
          className="readable"
          primaryText={ readable.title }
          secondaryText={ subhead }
          onTouchTap={this.handle_item_click.bind(this, readable)}
          rightIconButton={menu}
          leftAvatar={avatar} />

        { _notes }

      </div>
    );
  }
}
