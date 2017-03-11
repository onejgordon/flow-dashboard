var React = require('react');
import { FontIcon, IconButton, ListItem, List,
  Avatar, FlatButton } from 'material-ui';
var util = require('utils/util');
var api = require('utils/api');
var ReadableLI = require('components/list_items/ReadableLI');
import {findIndexById} from 'utils/store-utils';
import {cyanA400} from 'material-ui/styles/colors';
var ProgressLine = require('components/common/ProgressLine');

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
        readables: {}
    };
  }

  componentDidMount() {
    this.fetch_readables();
  }

  componentDidUpdate(prevProps, prevState) {

  }

  merge_readables(_readables) {
    let {readables} = this.state;
    _readables.forEach((r) => {
      readables[r.id] = r;
    });
    this.setState({readables});
  }

  fetch_readables() {
    api.get("/api/readable", {}, (res) => {
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
        res.push(<ReadableLI key={id} readable={r}
                    onUpdate={this.readable_update.bind(this)}
                    onDelete={this.readable_delete.bind(this)} />);
      }
    }
    return res;
  }

  render() {
    return (
      <div>
        <h1>Things to Read</h1>
        <List>
          { this.render_readables() }
        </List>

        <div className="vpad">
          <FlatButton key="gr" label="Fetch from Goodreads" onClick={this.fetch_from_goodreads.bind(this)} primary={true} />
          <FlatButton key="po" label="Fetch from Pocket" onClick={this.fetch_from_pocket.bind(this)} primary={true} />
        </div>
      </div>
    )
  }
}
