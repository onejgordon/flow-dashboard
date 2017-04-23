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
      editing: false
    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState) {
    let opening = !!prevProps.readable != !!this.props.readable && this.props.readable;
    if (opening) {
      let r = this.props.readable;
      if (r) {
        let form = {
          notes: r.notes,
          tags: r.tags.join(', ')
        }
        this.setState({form});
      }
    }
  }

  update_readable(r, params) {
    params.id = r.id;
    api.post("/api/readable", params, (res) => {
      if (this.props.onUpdate) this.props.onUpdate(res.readable);
    });
  }

  save() {
    let {readable} = this.props;
    let {form} = this.state;
    let params = {
      notes: form.notes,
      tags: form.tags
    }
    this.update_readable(readable, params);
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
    let {form, editing} = this.state;
    let title, content;
    let open = readable != null;
    let actions = [];
    if (open) {
      title = readable.title;
      if (readable.author) title += ` (${readable.author})`;
      actions = [
        <FlatButton label="Goto Source" onClick={this.goto_url.bind(this, this.get_link_url.bind(this))} />,
        <FlatButton label="Save" onClick={this.save.bind(this)} disabled={!editing} />,
        <FlatButton label="Edit" onClick={this.setState.bind(this, {editing: true})} disabled={editing} />,
      ]
      let params = {
        readable_id: readable.id
      };
      content = (
        <div style={{padding: '10px'}}>
          <div>
            <b>Read:</b> { readable.date_read || '--' }<br/>
            <b>URL:</b> { readable.url || '--' }<br/>
            <b>Source URL:</b> { readable.source_url || '--' }<br/>
          </div>

          <TextField floatingLabelText="Tags" value={form.tags}
                     onChange={this.changeHandler.bind(this, 'form', 'tags')}
                     disabled={!editing} />

          <h4>Notes</h4>
          <div style={{fontSize: '15px'}}>
            <TextField multiLine={true}
                       value={ form.notes || '' }
                       floatingLabelText="Notes"
                       onChange={this.changeHandler.bind(this, 'form', 'notes')}
                       fullWidth
                       disabled={!editing} />
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
