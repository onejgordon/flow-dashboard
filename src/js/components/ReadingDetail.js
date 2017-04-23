var React = require('react');
import {Dialog, FontIcon, Paper, TextField,
  RaisedButton, FlatButton} from 'material-ui';
var api = require('utils/api');
var QuoteLI = require('components/list_items/QuoteLI');
var FetchedList = require('components/common/FetchedList');
import {changeHandler} from 'utils/component-utils';


@changeHandler
export default class ReadingDetail extends React.Component {
  static propTypes = {
    readable: React.PropTypes.object
  }

  static defaultProps = {
    readable: null,
  }

  constructor(props) {
    super(props);
    this.state = {
      form: {},
      lastSave: new Date()
    };
  }

  save() {

  }

  render_quote(q) {
    return <QuoteLI key={q.id} quote={q} />
  }

  goto_url(url) {
    window.open(url, "_blank");
  }

  get_link_url() {
    let r = this.props.readable;
    return r.source_url || r.url;
  }

  render() {
    let {readable} = this.props;
    let {form} = this.state;
    let title, content;
    let open = readable != null;
    let actions = [];
    if (open) {
      title = readable.title;
      if (readable.author) title += ` (${readable.author})`;
      let disabled = this.state.lastSave < this.state.lastChange;
      actions = [
        <FlatButton label="Goto Source" onClick={this.goto_url.bind(this, this.get_link_url.bind(this))} />,
        <FlatButton label="Save" onClick={this.save.bind(this)} disabled={disabled} />,
      ]
      let params = {
        readable_id: readable.id
      };
      content = (
        <div>
          <TextField placeholder="Tags" value={form.tags} onChange={this.changeHandler.bind(this, 'form', 'tags')} />

          <h4>Notes</h4>
          <div style={{fontSize: '15px'}}>
            <TextField multiLine={true} value={ readable.notes || '' } onChange={this.changeHandler.bind(this, 'form', 'notes')} />
          </div>

          <h4>Quotes</h4>
          <FetchedList ref="quotes" params={params} url="/api/quote"
              listStyle="mui" listProp="quotes"
              per_page={20}
              renderItem={this.render_quote.bind(this)}
              fts_prop="quotes"
              paging_enabled={true}
              autofetch={true}/>

        </div>
        )
    }
    return (
      <Dialog open={open} title={title}
              onRequestClose={this.props.onDismiss.bind(this)}
              autoScrollBodyContent={true}
              actions={actions}>{content}</Dialog>
    );
  }
}
