var React = require('react');
import {browserHistory} from 'react-router';
import { FontIcon, IconButton, MenuItem, IconMenu, List,
  Dialog } from 'material-ui';
var api = require('utils/api');
var util = require('utils/util');
var ReadableLI = require('components/list_items/ReadableLI');
var BigProp = require('components/common/BigProp');

// Widget to show things to read
// Goodreads - Currently reading shelf
// Feeds from Pocket, etc

export default class ReadWidget extends React.Component {
  static defaultProps = {
    goodreads: true,
    pocket: false
  }
  constructor(props) {
    super(props);
    this.state = {
        readables: {},
        dialog_open: false,
        showing_type: null, // Int
    };
    this.LABELS = {
      1: "Article",
      2: "Book"
    }
  }

  componentDidMount() {
    this.fetch_readables();
  }

  componentDidUpdate(prevProps, prevState) {

  }

  count_readables() {
    let counts = {};
    let _readables = util.flattenDict(this.state.readables);
    _readables.forEach((r) => {
      if (!counts[r.type]) counts[r.type] = 0;
      if (!r.read) counts[r.type] += 1;
    });
    return counts;
  }

  none_loaded() {
    return Object.keys(this.state.readables).length == 0;
  }

  merge_readables(_readables) {
    let {readables} = this.state;
    _readables.forEach((r) => {
      readables[r.id] = r;
    });
    this.setState({readables});
  }

  fetch_readables() {
    api.get("/api/readable", {unread: 1}, (res) => {
      this.merge_readables(res.readables);
    });
  }

  fetch_from_goodreads() {
    api.get("/api/integrations/goodreads", {}, (res) => {
      this.merge_readables(res.readables);
    });
  }

  fetch_from_pocket() {
    api.get("/api/integrations/pocket", {}, (res) => {
      this.merge_readables(res.readables);
    });
  }

  show_readables(type) {
    this.setState({dialog_open: true, showing_type: type}, () => {
      if (this.none_loaded()) {
        this.fetch_readables();
      }
    });
  }

  dialog_title() {
    let {showing_type} = this.state;
    return this.LABELS[showing_type] + 's';
  }

  goto_advanced() {
    browserHistory.push(`/app/reading`);
  }
  readable_update(r) {
    this.merge_readables([r]);
  }

  readable_delete(id) {
    let {readables} = this.state;
    delete readables[id];
    this.setState({readables});
  }

  render_readables() {
    let {readables} = this.state;
    let res = [];
    for (var id in readables) {
      if (readables.hasOwnProperty(id)) {
        let r = readables[id];
        if (r.type == this.state.showing_type) {
          res.push(<ReadableLI key={id} readable={r}
                      onUpdate={this.readable_update.bind(this)}
                      onDelete={this.readable_delete.bind(this)} />);
        }
      }
    }
    return res;
  }

  render() {
    let {dialog_open} = this.state;
    let counts = this.count_readables();
    return (
      <div className="section">

        <div className="row">
          <div className="col-sm-6">
            <h3>Reading</h3>
          </div>
          <div className="col-sm-6">
            <IconMenu className="pull-right" iconButtonElement={<IconButton iconClassName="material-icons">more_vert</IconButton>}>
              <MenuItem key="gr" primaryText="Refresh from Goodreads" onClick={this.fetch_from_goodreads.bind(this)} leftIcon={<FontIcon className="material-icons">refresh</FontIcon>} />
              <MenuItem key="po" primaryText="Refresh from Pocket" onClick={this.fetch_from_pocket.bind(this)} leftIcon={<FontIcon className="material-icons">refresh</FontIcon>} />
              <MenuItem key="adv" primaryText="Advanced" onClick={this.goto_advanced.bind(this)} leftIcon={<FontIcon className="material-icons">list</FontIcon>} />
            </IconMenu>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6">
              <BigProp
                label="Books Currently Reading"
                value={ counts[2] || 0 }
                onClick={this.show_readables.bind(this, 2)} />

          </div>
          <div className="col-sm-6">
              <BigProp
                label="Unread Articles"
                value={ counts[1] || 0 }
                onClick={this.show_readables.bind(this, 1)} />

          </div>
        </div>

        <Dialog title={this.dialog_title()}
          open={dialog_open}
          onRequestClose={this.setState.bind(this, {dialog_open: false})}
          autoScrollBodyContent={true}>
          <List>
            { this.render_readables() }
          </List>
        </Dialog>

      </div>
    )
  }
}
