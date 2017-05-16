var React = require('react');
import { FontIcon, TextField, DropDownMenu, ListItem, List,
  MenuItem, Toggle, FlatButton, RaisedButton, Dialog,
  IconMenu, IconButton } from 'material-ui';
import {clone} from 'lodash';
var JSON5 = require('json5');

export default class ReactJSONEditor extends React.Component {
  static defaultProps = {
    array: false, // If false, assumes flat JSON object
    data: null,
    attributes: [], // Define each prop in object (or in each object, if array == true)
    // Each attribute is an object { name, title, hint, type }
    onChange: null,
    primaryProp: 'label',
    secondaryProp: null,
    editButtonLabel: "Edit Object",
    addButtonLabel: "New Item",
    enableRawJSONEditing: true,
    changeCallbackType: "json"
  }

  constructor(props) {
      super(props);
      this.state = {
        editing: false,
        editing_raw: false,
        editing_index: null,
        form: {}
      };
  }

  open_editor(index) {
    let item;
    if (index != null) item = this.get_editing_item(index);
    else item = this.props.data;
    this.setState({editing: true, editing_index: index, form: clone(item) || {}});
  }

  open_raw_editor() {
   this.setState({editing: true, editing_raw: true, form: {raw: JSON5.stringify(this.props.data)}});
  }

  close_editor() {
    this.setState({editing: false, editing_raw: false, editing_index: null, form: {}});
  }

  save() {
    let {editing_index, form, editing_raw} = this.state;
    let {changeCallbackType} = this.props;
    let raw;
    if (editing_raw) {
      raw = form.raw;
      form = JSON5.parse(raw);
    }
    if (changeCallbackType == 'json') this.props.onChange(editing_index, form);
    else if (changeCallbackType == 'full_string') this.props.onChange(raw);
    this.close_editor();
  }

  handleTargetChange(name, event) {
    let {form} = this.state;
    form[name] = event.target.value;
    this.setState({form});
  }

  handleDropDownChange(name, event, index, value) {
    let {form} = this.state;
    form[name] = value;
    this.setState({form});
  }

  handleValueChange(name, value) {
    let {form} = this.state;
    form[name] = value;
    this.setState({form});
  }

  handleToggleChange(name, event, toggled) {
    let {form} = this.state;
    form[name] = toggled;
    this.setState({form});
  }

  get_editing_item(index) {
    let {array, data} = this.props;
    let {editing_index} = this.state;
    let _index = index == null ? editing_index : index;
    if (array) return data[_index];
    else return data;
  }

  new_item() {
    let {data, changeCallbackType} = this.props;
    let new_index = data.length;
    if (changeCallbackType == 'json') this.props.onChange(new_index, {});
    else if (changeCallbackType == 'full_string') {
      data.push({});
      this.props.onChange(JSON.stringify(data));
    }
  }

  render_data() {
    let {data, array, primaryProp, secondaryProp, attributes} = this.props;
    if (array) {
      let _items = data.map((item, i) => {
        let rightIconMenu = (
            <IconMenu iconButtonElement={<IconButton iconClassName="material-icons">more_vert</IconButton>}>
              <MenuItem leftIcon={<FontIcon className="material-icons">delete</FontIcon>} onClick={this.props.onChange.bind(this, i, null)}>Delete</MenuItem>
            </IconMenu>
          );
          return <ListItem
                    key={i}
                    primaryText={item[primaryProp] || "New Item"}
                    secondaryText={item[secondaryProp] || "--" }
                    rightIconButton={rightIconMenu}
                    onTouchTap={this.open_editor.bind(this, i)} />
          })
      return (
        <List>
          { _items }
        </List>
        );
    } else {
      // Render all props of item
      let _props = attributes.map((att, i) => {
        let show_value = data[att.name] == null ? att.default_value : data[att.name];
        return (
          <li key={i}>
            <b>{att.title}:</b> { show_value.toString() }
          </li>
          );
      });
      return (
        <ul>
          { _props }
        </ul>
        )
    }
  }

  render_input(att, val) {
    let {editing_index} = this.state;
     let form_value = val == null ? att.default_value : val;
    if (att.type == 'text' || att.type == 'number') {
      return <TextField name={att.name} value={form_value} onChange={this.handleTargetChange.bind(this, att.name)} placeholder={att.title} fullWidth />
    } else if (att.type == 'checkbox') {
      return <Toggle name={att.name} toggled={form_value} onToggle={this.handleToggleChange.bind(this, att.name)} label={att.title} labelPosition="right" />
    } else if (att.type == 'dropdown') {
      return (
        <div><br/>
        <DropDownMenu value={val || att.default_value} onChange={this.handleDropDownChange.bind(this, att.name)}>
          { att.options.map((op) => {
            return <MenuItem key={op.value} value={op.value} primaryText={op.label} />
          }) }
        </DropDownMenu>
        </div>
      );
    }
  }

  render_editor() {
    let {editing, editing_index, editing_raw, array, form} = this.state;
    let {data, attributes} = this.props;
    let content;
    if (editing) {
      if (editing_raw) {
        content = (
          <div>
            <label>Raw JSON</label>
            <TextField name="raw" value={form.raw} onChange={this.handleTargetChange.bind(this, 'raw')} multiLine fullWidth />
          </div>
          )
      } else {
        content = attributes.map((att, i) => {
          let val = form[att.name];
          let hint;
          if (att.hint) hint = <div><small>{ att.hint }</small></div>
          return (
            <div key={i}>
              <label>{ att.title }</label>
              { hint }
              { this.render_input(att, val) }
            </div>
          )
        })
      }
    }
    let actions = [
      <RaisedButton key="save" label="Save" primary={true} onClick={this.save.bind(this)} />,
      <FlatButton key="cancel" label="Cancel" onClick={this.close_editor.bind(this)} />
    ];
    return (
      <Dialog open={editing}
              actions={actions}
              onRequestClose={this.close_editor.bind(this)}
              autoDetectWindowHeight={true} autoScrollBodyContent={true}
              width={300}
              title="Editor">
        <div style={{paddingTop: "10px"}}>
        {content}
        </div>
      </Dialog>
      )
  }

  render_actions() {
    let {array, editButtonLabel, addButtonLabel, enableRawJSONEditing} = this.props;
    let buttons = [];
    if (array) {
      buttons.push(<RaisedButton primary={true} key="add" label={addButtonLabel} onClick={this.new_item.bind(this)} />);
    } else {
      buttons.push(<RaisedButton primary={true}  key="edit" label={editButtonLabel} onClick={this.open_editor.bind(this, null)} />);
    }
    if (enableRawJSONEditing) buttons.push(<FlatButton key="raw" icon={<FontIcon className="material-icons">code</FontIcon>} label="Edit Raw JSON" onClick={this.open_raw_editor.bind(this)} />);
    return <div>{buttons}</div>;
  }

  render() {
    let {title} = this.props;
    return (
      <div className="ReactJsonEditor">
        { this.render_editor() }
        { this.render_data() }
        { this.render_actions() }
      </div>
      )
  }
}

