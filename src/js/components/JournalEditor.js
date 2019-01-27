var PropTypes = require('prop-types');
var React = require('react');
import {Paper, TextField, List, ListItem, Slider} from 'material-ui';
var api = require('utils/api');

export default class JournalEditor extends React.Component {
  static propTypes = {
    questions: PropTypes.array,
    onChange: PropTypes.func,
    form: PropTypes.object
  }

  static defaultProps = {
    questions: [],
  }

  constructor(props) {
    super(props);
    this.state = {
      // Tags
      tags: [],
      tags_loading: false,
      tags_loaded: false,
    }
  }

  componentDidMount() {
    let {tags_loading, tags_loaded} = this.state;
    if (!tags_loading && !tags_loaded) this.fetch_tags();
  }

  changeHanderVal(key, val) {
    let {form} = this.props;
    form[key] = val;
    this.props.onChange(form);
  }

  changeHandler(key, event) {
    this.changeHanderVal(key, event.currentTarget.value);
  }

  changeHandlerSlider(key, event, value) {
    this.changeHanderVal(key, value);
  }

  fetch_tags() {
    api.get("/api/journaltag", {}, (res) => {
      this.setState({tags: res.tags});
    })
  }

  get_params(form_data) {
    let {questions} = this.props;
    if (form_data == null) form_data = this.props.form
    let params = {data: JSON.stringify(form_data)};
    questions.forEach((q) => {
      if (q.parse_tags) params.tags_from_text = form_data[q.name];
    });
    return params;
  }

  text_questions() {
    let {questions} = this.props;
    return questions.filter((q) => {
      return q.response_type == 'text'
    })
  }

  handle_tag_add(tag, qname) {
    let {form} = this.props;
    let val = form[qname];
    let idx = val.lastIndexOf(tag.type == 1 ? '@' : '#');
    if (idx > -1) {
      form[qname] = form[qname].slice(0, idx) + tag.id + ' ';
    }
    this.setState({form}, () => {
      this.refs[qname].focus();
    });
  }

  filtered_tags(search) {
    let {tags} = this.state;
    let person = search.startsWith('@');
    let stripped = search.slice(1); // Without prefix
    let type = person ? 1 : 2;
    return tags.filter((tag) => {
      return tag.name.toLowerCase().indexOf(stripped.toLowerCase()) > -1 && tag.type == type;
    });
  }

  render_tag_suggest(str, qname) {
    let {tags_loading} = this.state;
    let entering_tag = false;
    let _content, _selector;
    let last_space = str.lastIndexOf(' ');
    let last_word = "";
    if (last_space > -1) {
      last_word = str.slice(last_space + 1);
    } else {
      last_word = str;
    }
    if ((last_word.startsWith('#') || last_word.startsWith('@')) && !last_word.endsWith('.')) {
      entering_tag = true;
    }
    if (entering_tag) {
      if (tags_loading) _content = "Loading";
      else {
        let lis = this.filtered_tags(last_word).map((tag) => {
          return <ListItem primaryText={tag.name} onTouchTap={this.handle_tag_add.bind(this, tag, qname)} />
        })
        if (lis.length == 0) _content = <div className="empty">No suggestions</div>
        else _content = (
          <List>
            { lis }
          </List>
        );
      }
      _selector = (
        <Paper style={{maxHeight: "400px"}}>
          { _content }
        </Paper>
      );

    }
    return (
      <div>
        { _selector }
      </div>
    );
  }

  render_questions() {
    let {questions} = this.props;
    let {form} = this.props;
    return questions.map((q, i) => {
      let _response;
      let _tags;
      let _hint;
      let val = form[q.name];
      if (q.parse_tags && q.response_type == 'text') {
        _tags = this.render_tag_suggest(val || "", q.name);
        _hint = <small>You can @mention and #activity tag</small>
      }
      if (!q.response_type || q.response_type == 'text') _response = <TextField name={q.name} ref={q.name} value={val || ''} multiLine onChange={this.changeHandler.bind(this, q.name)} fullWidth={true} />
      else if (q.response_type == 'slider' || q.response_type == 'number') _response = <Slider name={q.name} value={val} onChange={this.changeHandlerSlider.bind(this, q.name)} max={10} min={1} defaultValue={5} step={1} />
      else if (q.response_type == 'number_oe') _response = <TextField name={q.name} ref={q.name} type='number' value={val || ''} onChange={this.changeHandler.bind(this, q.name)} fullWidth={true} />
      return (
        <div key={i}>
          <p className="lead">{ q.text }</p>
          { _hint }
          { _response }
          { _tags }
        </div>
      )
    });
  }

  render() {
    return (
      <div>
        { this.render_questions() }
      </div>
    )
  }
}
