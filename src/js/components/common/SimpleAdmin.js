var React = require('react');
var ReactDOM = require('react-dom');
import { withRouter } from 'react-router'
var LoadStatus = require('./LoadStatus');
import $ from 'jquery';
var util = require('utils/util');
var toastr = require('toastr');
var bootbox = require('bootbox');
var api = require('utils/api');
var ReactTooltip = require('react-tooltip');
import { browserHistory } from 'react-router';

import {clone} from 'lodash';
var mui = require('material-ui'),
  FlatButton = mui.FlatButton,
  RaisedButton = mui.RaisedButton,
  Dialog = mui.Dialog;

var Select = require('react-select');

class EditForm extends React.Component {
  static defaultProps = {
    creating_new: false,
    visible: true,
    show_buttons: true
  };

  constructor(props, context) {
    super(props, context);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      advancedShowing: false,
      ins_inputs: {}
    };
  }

  showAdvanced() {
    this.setState({advancedShowing: true});
  }

  componentDidMount() {

  }

  handleSubmit() {
    var that = this;
    var data = util.serializeObject($(ReactDOM.findDOMNode(this.refs.form)));
    this.props.onFormSubmit(data);
    return false;
  }

  handleCancel(event) {
    this.props.onFormCancel();
  }

  handleDelete(event) {
    if (!this.props.disableDelete) {
      if (this.props.confirm_delete) {
        bootbox.confirm("Really delete?", (ok) => {
          if (ok) this.props.onFormDelete();
        });
      } else {
        this.props.onFormDelete();
      }
    }
  }

  handleChange(attr, value) {
    // Currently handles events only
    var setval;
    if (value && typeof(value) == 'object') {
      var e = value; // Event
      var targ = e.target;
      if (targ.type == 'checkbox') setval = targ.checked;
      else setval = targ.value;
    }
    this.handleValChange(attr.name, setval);
  }

  handleValChange(prop, value) {
    var i = this.props.item || {};
    i[prop] = value;
    this.props.onFormChange(i, this.props.creating_new);
  }

  handleInstrumentChange(prop, value) {
    var inputs = this.state.ins_inputs;
    inputs[prop] = value;
    this.setState({ins_inputs: inputs})
    var i = this.props.item || {};
    i[prop] = value? value.key: null;
    this.props.onFormChange(i, this.props.creating_new);
  }

  handleMultiValChange(prop, option_array) {
    var i = this.props.item || {};
    var final_value = [];
    if (option_array != null) final_value = option_array.map(function(op) {
      return op.value;
    });
    i[prop] = final_value;
    this.props.onFormChange(i, this.props.creating_new);
  }

  renderFormField(att, item, i) {
    var editable = att.editable instanceof Function? att.editable(att, item, i): att.editable;

    if (editable) {
      var fixed = att.fixed && !this.props.creating_new;
      var key = 'input_'+att.name;
      var classes = "form-control";
      if (att.datepicker) classes += ' datepicker';
      var value_out = item[att.name];
      var label = att.label || util.capitalize(att.name);
      var _hint;
      var req = att.required ? <i className="glyphicon glyphicon-asterisk" style={{color: '#FEBFC0'}} title="Required" /> : <span></span>;
      if (att.hint) _hint = <i className="glyphicon glyphicon-question-circle" data-tip={att.hint} title={att.hint}></i>;
      var _label = <label htmlFor={key} className="col-sm-3 control-label">{ _hint }&nbsp;{ label } { req }</label>
      if (att.dataType == 'boolean') {
        var checked = value_out;
        return (
          <div className="form-group" key={"ff"+i}>
            <div className="col-sm-offset-3 col-sm-9">
              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    className="switch"
                    key={key}
                    id={key}
                    name={att.name}
                    placeholder={label}
                    ref={att.name}
                    value="1"
                    onChange={this.handleChange.bind(this, att)}
                    disabled={fixed}
                    checked={checked}/>
                  { _hint }&nbsp;{ label }
                </label>
              </div>
            </div>
          </div>
          );
      } else if ((att.inputType == 'list') || (att.inputType == 'select')){
        var boundOnChange = att.multiple ? this.handleMultiValChange.bind(this, att.name) : this.handleValChange.bind(this, att.name);
        return (
          <div className="form-group" key={"ff"+i}>
            { _label }
            <div className="col-sm-9">
              <Select
                name={att.name}
                ref={att.name}
                value={value_out}
                multi={att.multiple}
                options={att.opts}
                simpleValue={!att.multiple}
                onChange={boundOnChange}>
                </Select>
            </div>
          </div>
          );
      } else if (att.inputType == 'textarea') {
        return (
        <div className="form-group" key={"ff"+i}>
          { _label }
          <div className="col-sm-9">
            <textarea className={classes}
              key={key}
              id={key}
              name={att.name}
              placeholder={label}
              ref={att.name}
              resize={true}
              value={ value_out }
              onChange={this.handleChange.bind(this, att)}
              disabled={fixed}/>
            </div>
        </div>
        );
      } else {
        return (
          <div className="form-group" key={"ff"+i}>
            { _label }
            <div className="col-sm-9">
              <input type="text" className={classes}
                key={key}
                id={key}
                name={att.name}
                placeholder={label}
                ref={att.name}
                value={ value_out || ""}
                onChange={this.handleChange.bind(this, att)}
                disabled={fixed}/>
            </div>
          </div>
        );
      }
    }
  }

  render() {
    var item = this.props.item;
    var btn_text = this.props.creating_new ? 'Create' : 'Update';
    var that = this;
    var formAtts;
    if (this.props.creating_new) formAtts = this.props.attributes.filter(function(x) { return x.showInCreate == null || x.showInCreate; } );
    else formAtts = this.props.attributes.filter(function(x) { return x.showInEdit == null || x.showInEdit; } );
    var regFormAtts = formAtts.filter(function(att) {
      return !att.advanced;
    });
    var advancedFormAtts = formAtts.filter(function(att) {
      return att.advanced;
    });
    var hide_delete = (this.props.creating_new || this.props.disableDelete);
    var itemkey = item ? item[this.props.unique_key] : "";
    var formClass= this.props.unpad_form ? "editForm form-horizontal": "editForm well form-horizontal";
    var _delete;
    if (!hide_delete) _delete = <FlatButton onClick={this.handleDelete} hidden={hide_delete} style={{color: "red"}}><i className="glyphicon glyphicon-trash"></i> Delete</FlatButton>
    return (
      <form className={formClass} ref="form" hidden={!this.props.visible}>
        { regFormAtts.map(function(att, i, arr) {
          return this.renderFormField(att, item, i)
        }, this) }
        <div hidden={this.state.advancedShowing || advancedFormAtts.length==0}>
          <button type="button" className="btn btn-default center-block" onClick={this.showAdvanced.bind(this)}>Show advanced</button>
        </div>
        <div className="well" hidden={!this.state.advancedShowing}>
          <h4>Advanced</h4>
          { advancedFormAtts.map(function(att, i, arr) {
            return this.renderFormField(att, item, i)
          }, this) }
        </div>

        <input type="hidden" name={this.props.unique_key} value={itemkey} />
        <p></p>
        <div hidden={!this.props.show_buttons}>
          <div className="form-group">
            <div className="btn-group pull-right" role="group">
              <RaisedButton onClick={this.handleSubmit} label={btn_text} primary={true} />
              <FlatButton onClick={this.handleCancel} icon={<i className="glyphicon glyphicon-close"></i>} label="Cancel" />
              { _delete }
            </div>
          </div>
        </div>
      </form>
    );
  }
}

class Item extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleGotoDetail = this.handleGotoDetail.bind(this);
  }

  handleEdit(item) {
    this.props.onEdit(item);
  }


  handleGotoDetail(item) {
    if (this.props.onGotoDetail) this.props.onGotoDetail(item);
  }

  renderCell(content, key, _classes) {
    var classes = _classes || "";
    var style = this.props.style;
    if (style == 'table') return <td key={key} className={classes}>{ content }</td>;
    else if (style == 'list') return <span key={key} className={classes}>{ content }</span>;
  }

  render() {
    var item = this.props.item;
    var unique_key = this.props.unique_key;
    var tableAtts = this.props.attributes.filter(function(att) {return att.showInList == null || att.showInList});
    var hlItem = false;
    var data_els = tableAtts.map(function(att) {
      var key = att.name +'_'+item[unique_key];
      var value_out;
      if (typeof(att.fromValue) === "function") {
        try {
          value_out = att.fromValue(item[att.name], item);
        } catch (e) { console.info(e); }
      } else value_out = item[att.name];
      if (typeof(value_out) == 'boolean') {
        value_out = value_out ? (<i className='glyphicon glyphicon-check'></i>) : <i></i>;
      }
      var classes = "";
      if (att.hlValue && value_out == att.hlValue) hlItem = true;
      if (att.listClass) classes += " "+att.listClass;
      if (att.clickAction == 'edit') return this.renderCell(<a href='javascript:void(0)' onClick={this.handleEdit.bind(this, item)}>{value_out}</a>, key, classes);
      else if (att.clickAction == 'detail') return this.renderCell(<a href='javascript:void(0)' onClick={this.handleGotoDetail.bind(this, item)}>{value_out}</a>, key, classes);
      else if (typeof att.render === 'function') return this.renderCell(att.render(item), key, classes);
      else return this.renderCell(value_out, key, classes);
    }, this);
    var classes = "item";
    var statusClass;
    if (this.props.is_selected) statusClass = "info";
    else if (hlItem) statusClass = "success";
    var actions = [];
    if (this.props.additionalActions) {
      actions = this.props.additionalActions.map(function(action, i, arr) {
        var link = action.link(item);
        return <a href={link} data-toggle="tooltip" title={action.label} key={i}><i className={"glyphicon glyphicon-"+action.icon}></i></a>;
      });
    }
    if (typeof(this.props.detail_url) === "function") {
      actions.push(<a href="javascript:void(0)" key="detail" onClick={this.handleGotoDetail.bind(this, item)} data-toggle="tooltip" title="Detail"><i className="glyphicon glyphicon-binoculars"></i></a>)
    }
    var _actions = this.renderCell(
        <span className="pull-right btn-group">
          <a href="javascript:void(0)" onClick={this.handleEdit.bind(this, item)} data-toggle="tooltip" title="Edit"><i className="glyphicon glyphicon-pencil"></i></a>
          { actions }
        </span>, item[unique_key]);
    if (this.props.style == 'table') {
      var _statusClass = statusClass || "";
      return (
        <tr className={classes + " " + _statusClass}>
          {data_els}
          { _actions }
        </tr>
      );
    } else if (this.props.style == 'list') {
      var _statusClass = ("list-group-item-"+statusClass) || "";
      return (
        <li className={classes + " list-group-item " + _statusClass}>
        { _actions }
          {data_els}
        </li>
      );
    }
  }
}

export default class SimpleAdmin extends React.Component {
  contextTypes: {
    router: React.PropTypes.object.isRequired
  }
  static defaultProps = {
    entity_name: 'Entity',
    attributes: [],
    pageheader: '',
    unique_key: 'key',
    max: 100,
    table_class: '',
    add_params: {},
    url: null, // URL for getting list
    pagingEnabled: false,
    redirect_type: "location", // "replaceState"
    style: 'table',
    form_display: 'popup', // or 'popup'
    redirect_url: null,
    getListFromJSON: function(res) {return res;},
    getObjectFromJSON: function(res) {return res;},
    canEdit: true,
    confirm_delete: true
  };

  constructor(props, context) {
    super(props, context);
    this.delete = this.delete.bind(this);
    this.fetchMore = this.fetchMore.bind(this);
    this.gotoDetail = this.gotoDetail.bind(this);
    this.save = this.save.bind(this);

    this.state = {
      items: [],
      page: 0,
      isMore: true, // Whether there are additional items to list (not yet fetched)
      form: {},
      status: 'closed',
      loading: false
    };
  }

  componentWillMount() {
    this.fetchItems();
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps){
      if(JSON.stringify(nextProps.add_params) != JSON.stringify(this.props.add_params) || nextProps.url != this.props.url){
          console.log("params changed");
          this.setState({items: [], page: 0}, this.fetchItems);
      }
  }

  componentWillUpdate(nextProps, nextState) {
  }

  fetchMore() {
    // Ajax fetch with page
    this.setState({page: this.state.page+1}, this.fetchItems);
  }

  fetchItems() {
    var that = this;
    this.setState({loading: true});
    var nextPage = this.state.page;
    var data = {max: this.props.max || 100, page: nextPage};
    util.mergeObject(data, this.props.add_params);
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      data: data,
      success: function(data) {
        var newItems = this.props.getListFromJSON(data);
        var isMore = newItems.length == this.props.max;
        var items = this.state.items.concat(newItems);
        this.setState({items: items, loading: false, isMore: isMore}, function() {
          if (that.props.onItemsFetched) that.props.onItemsFetched(newItems);
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(that.props.url, status, err.toString());
        this.setState({loading: false});
      }.bind(this)
    });
  }

  redirect(url) {
    if (this.props.redirect_type == "location") window.location = url;
    else if (this.props.redirect_type == "replaceState") {
      this.cancel();
      browserHistory.push(url);
    }
  }

  gotoDetail(item) {
    if (this.props.detail_url) {
      var url = this.props.detail_url(item);
      if (url) {
        this.redirect(url);
      }
    }
  }

  cancel() {
    this.setState({status: 'closed', form: {}});
  }

  dialog_open() {
    return this.state.status == 'new' || this.state.status == 'edit';
  }

  handleFormChange(item) {
    this.setState({form: item});
  }

  begin_editing(item, creating_new) {
    var form = clone(item);
    // Update props based on formFromValue adapters, if present
    this.props.attributes.forEach(function(att, i) {
      if (typeof(att.formFromValue) === "function") {
        try {
          form[att.name] = att.formFromValue(item[att.name], item);
        } catch (e) { console.info(e); }
      } else if (form[att.name] == null && att.defaultValue) {
        form[att.name] = att.defaultValue;
      }
    });
    this.setState({form: form, status: creating_new ? 'new' : 'edit'});
  }

  delete() {
    var item = this.state.form;
    var that = this;
    if (item) {
      this.setState({form: {}, status: 'closed'});
      api.post(this.props.url+'/delete', item, function(resp) {
        if (resp.success) {
          var items = that.state.items.filter(function (candidate) {
            return candidate[that.props.unique_key] != item[that.props.unique_key];
          });
          that.setState({items: items });
          toastr.success(that.props.entity_name + " deleted");
        } else toastr.error("Failed to delete " + that.props.entity_name);
      }, null, {no_success_bool: true});
    }
  }

  save() {
    var items = this.state.items;
    var creating_new = this.state.status == 'new';
    var st = {};
    var data = clone(this.state.form);
    this.props.attributes.forEach(function(att, i) {
      if (typeof(att.toValue) === "function") {
        data[att.name] = att.toValue(data[att.name]);
      }
      if (att.multiple && data[att.name] instanceof Array) data[att.name] = data[att.name].join(',');
    });
    data.create_new = creating_new ? 1 : 0;
    util.mergeObject(data, this.props.add_params);
    api.post(this.props.url, data, (res) => {
      var item = this.props.getObjectFromJSON(res);
      var entname = this.props.entity_name;
      if (creating_new) {
        if (this.props.redirect_url) {
          var url = this.props.redirect_url(item);
          if (url) this.redirect(url);
        }
        if (this.props.onItemCreated) this.props.onItemCreated(item);
        items.push(item);
      } else {
        util.updateByKey(item, items, this.props.unique_key);
      }
      this.setState({items: items, status: 'closed', form: {}});
    }, null);
  }

  startNew() {
    this.begin_editing({}, true);
  }

  render() {
    var list, more;
    var items = this.state.items;
    var headers = this.props.attributes.filter(function(att) { return att.showInList == null || att.showInList; } );
    var itemHeaders = headers.map(function(att) {
      var key = 'th_'+att.name;
      var label = att.label || util.capitalize(att.name);
      var style = this.props.style;
      return <th key={key}>{label}</th>
    }, this);
    var itemNodes = items.map(function (item, i, arr) {
      var is_selected = (this.state.form && item[this.props.unique_key] == this.state.form[this.props.unique_key]);
      return <Item
              key={item[this.props.unique_key]}
              item={item}
              style={this.props.style}
              is_selected={is_selected}
              attributes={this.props.attributes}
              unique_key={this.props.unique_key}
              onEdit={this.begin_editing.bind(this, item, false)}
              onDelete={this.delete.bind(this, item)}
              detail_url={this.props.detail_url}
              additionalActions={this.props.additionalActions}
              onGotoDetail={this.gotoDetail.bind(this, item)} />
    }, this);
    var itemList;
    if (this.props.style == 'table') {
      var pageheader = this.props.pageheader;
      itemList = (<table className={this.props.table_class + ' table table-striped sa'}>
          <caption> <h1>{ pageheader } </h1> </caption>
          <thead>
            <tr>
              {itemHeaders}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody ref="rows">
            {itemNodes}
          </tbody>
        </table>);
    } else if (this.props.style == 'list') {
      itemList = <ul className="sa list-group" ref="rows">{itemNodes}</ul>;
    }
    var creating_new = this.state.status=='new';
    var editform = <EditForm
          unique_key={this.props.unique_key}
          visible={this.state.status != 'closed'}
          item={this.state.form}
          attributes={this.props.attributes}
          show_buttons={this.props.form_display != 'popup'}
          disableDelete={this.props.disableDelete}
          onFormDelete={this.delete}
          onFormSubmit={this.save}
          onFormChange={this.handleFormChange.bind(this)}
          onFormCancel={this.cancel.bind(this)}
          confirm_delete={this.props.confirm_delete}
          unpad_form = {this.props.form_display == 'popup'}
          creating_new={creating_new}/>
    if (this.props.form_display == 'popup'){
      let buttons = [];
      var title = creating_new ? "Create Item" : "Edit Item";
      if (this.props.canEdit){
        var submit_text = creating_new ? 'Create' : 'Update';
        buttons.push(<FlatButton label={submit_text} onClick={this.save.bind(this)} primary={true} key="save" />);
      }
      if (!creating_new && !this.props.disableDelete) buttons.push(<FlatButton label="Delete" onClick={this.delete.bind(this)} secondary={true} style={{color: 'red'}} key="delet" />)
      buttons.push(<FlatButton label="Cancel" onClick={this.cancel.bind(this)} key="cancel" />)
      var formtoshow = (<Dialog open={this.dialog_open()} onRequestClose={this.cancel.bind(this)} title={title} actions={buttons} autoDetectWindowHeight={true} autoScrollBodyContent={true}>
          <div style={{marginTop: "8px"}}>{editform}</div>
        </Dialog>);
    } else {
      var formtoshow = editform
    }
    if (this.state.isMore && !this.state.loading) more = <button className="btn btn-default btn-sm center-block" onClick={this.fetchMore}><i className="glyphicon glyphicon-sort-down"></i> Show More</button>
    return (
      <div className="Activity">
        { itemList }
        { more }
        <LoadStatus loading={this.state.loading} empty={itemNodes.length == 0} />
        <ReactTooltip place="top" effect="solid" className="em-react-tooltip" />
        <div hidden={this.state.status != 'closed'}>
          <RaisedButton onClick={this.startNew.bind(this)} primary={true} label="New" />
        </div>

        {formtoshow}

      </div>
    );
  }
}
