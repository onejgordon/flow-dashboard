var React = require('react');
var api = require('utils/api');
import {IconButton, List, ListItem, FlatButton, TextField, Paper} from 'material-ui';
import {clone} from 'lodash';
var util = require('utils/util');
import {changeHandler} from 'utils/component-utils';


@changeHandler
export default class FetchedList extends React.Component {
  static defaultProps = {
    url: null,
    params: {},
    listProp: 'items',
    labelProp: 'label',
    subProp: null,
    listStyle: 'list', // or 'mui'
    autofetch: false,
    per_page: 30,
    fts_url: null,
    fts_prop: null,
    paging_enabled: false,
    renderItem: null // Function
  };

  constructor(props) {
    super(props);
    this.state = {
      form: {},
      items: [],
      loading: false,
      page: 0,
      more_data: true
    };
  }

  componentWillReceiveProps(nextProps) {
  }

  componentDidUpdate(prevProps, prevState) {
    var refetch = prevProps.autofetch != this.props.autofetch || prevProps.url != this.props.url;
    if (refetch) this.refresh();
  }

  componentDidMount() {
    if (this.props.autofetch) this.fetchData();
  }

  handle_more() {
    this.fetchData();
  }

  search() {
    let {form} = this.state;
    if (form.search_term && form.search_term.length > 0) {
      let term = form.search_term;
      this.setState({items: [], loading: true}, () => {
        api.get(this.props.fts_url, {term: term}, (res) => {
          this.setState({items: res[this.props.fts_prop], more_data: false, loading: false});
        });
      });
    }
  }

  fetchData() {
    if (this.props.url) {
      var params = clone(this.props.params);
      if (this.props.paging_enabled) {
        params.page = this.state.page;
        params.max = this.props.per_page;
      }
      this.setState({loading: true}, () => {
        api.get(this.props.url, params, (res) => {
          if (res.success) {
            var fetched_items = res[this.props.listProp];
            var st = {loading: false};
            if (this.props.paging_enabled) {
              st.items = this.state.items.concat(fetched_items);
              st.page = params.page + 1;
              st.more_data = fetched_items != null && fetched_items.length == this.props.per_page;
            } else {
              st.items = fetched_items;
            }
            this.setState(st)
          }
        });
      })
    }
  }

  handleItemClick(i) {
    if (this.props.onItemClick) this.props.onItemClick(i);
  }

  refresh() {
    this.setState({items: [], page: 0 }, this.fetchData);
  }

  remove_item_by_key(key, _keyProp) {
    var keyProp = _keyProp || "key";
    var items = this.state.items;
    for (var i=0; i<items.length; i++) {
      var _item = items[i];
      if (_item) {
        var keyval = _item[keyProp];
        if (keyval == key) {
          // Match
          items.splice(i, 1);
          break;
        }
      }
    }
    this.setState({items: items});
  }

  update_item_by_key(item, _keyProp, _delete, _add_to) {
    var add_to = _add_to || "top";
    var do_delete = _delete || false;
    var keyProp = _keyProp || "key";
    var items = this.state.items;
    let success = util.updateByKey(item, items, keyProp, do_delete);
    if (success) {
      this.setState({items: items})
    } else {
      if (!do_delete) {
        var new_items = this.state.items;
        if (add_to == "top") new_items.unshift(item);
        else if (add_to == "bottom") new_items.push(item);
        this.setState({items: new_items});
      }
    }
  }

  empty() {
    return this.state.items.length == 0;
  }

  render() {
    let {form} = this.state;
    let {fts_url} = this.props;
    let _search_box;
    var _items = this.state.items.map(function(item, i, arr) {
      if (this.props.renderItem != null) return this.props.renderItem(item);
      else {
        var name = item[this.props.labelProp] || "Unnamed";
        var sub = item[this.props.subProp] || null;
        if (this.props.listStyle == 'list') {
          return <li className="list-group-item" key={i}>
            <a href="javascript:void(0)" className="title" onClick={this.handleItemClick.bind(this, item)}>{ name }</a>
            </li>
        } else if (this.props.listStyle == 'mui') {
          return <ListItem key={i} primaryText={name} leftIcon={this.props.icon} secondaryText={sub} onClick={this.handleItemClick.bind(this, item)} />
        }
      }
    }, this);
    var ristatus = this.state.loading ? "loading" : "hide";
    var empty = this.empty();
    var _list;
    if (this.props.listStyle == 'list') {
      _list = (
        <ul className="list-group" hidden={empty}>
          { _items }
        </ul>
        )
    } else if (this.props.listStyle == 'mui') {
      _list = (
        <Paper>
          <List hidden={empty}>
            { _items }
          </List>
        </Paper>
        )
    }
    var n_fetched = this.state.items.length;
    var load_more_section = (
      <div className="clearfix vpad" hidden={n_fetched == 0}>
        <small>{"Showing " + n_fetched + "."}</small>
        <div hidden={!this.state.more_data || !this.props.paging_enabled}>
          <button onClick={this.handle_more.bind(this)} disabled={this.state.loading}
            className="btn btn-default btn-sm">
            { this.state.loading? <span><i className="fa fa-spin fa-cog"></i> Loading...</span> : 'Load More' }
          </button>
        </div>
      </div>
    );
    if (fts_url) _search_box = (
      <span>
        <TextField name="search"
          floatingLabelText="Enter search query..."
          value={form.search_term || ''}
          onChange={this.changeHandler.bind(this, 'form', 'search_term')} />
        <FlatButton label="Search" onClick={this.search.bind(this)} />
      </span>
      );
    return (
      <div>
        { _search_box }
        <IconButton iconClassName="material-icons" onClick={this.refresh.bind(this)}>refresh</IconButton>
        { _list }
        <div hidden={!empty}>
          <div className="empty">
            <i className="fa fa-warning"></i><br/>
            <span>Nothing to show</span>
          </div>
        </div>
        { load_more_section }
      </div>
    );
  }
}
