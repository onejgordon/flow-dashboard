var React = require('react');
import {Paper, IconMenu, IconButton, MenuItem, FontIcon} from 'material-ui';
import {changeHandler} from 'utils/component-utils';
var ProgressLine = require('components/common/ProgressLine');


@changeHandler
export default class JournalLI extends React.Component {
  static propTypes = {
    journal: React.PropTypes.object,
    questions: React.PropTypes.array,
    onEditClick: React.PropTypes.func
  }

  static defaultProps = {
    questions: [],
    journal: null,
  }

  constructor(props) {
    super(props);
    this.state = {}
  }

  handle_edit_click() {
    this.props.onEditClick();
  }

  render() {
    let {journal, questions} = this.props;
    let data = journal.data;
    let responses = questions.map((q, i) => {
      let q_response = data[q.name];
      let q_response_rendered = "N/A";
      let rt = q.response_type;
      if (q_response != null) {
        if (rt == 'text') q_response_rendered = <div style={{fontFamily: 'monospace'}}>{q_response}</div>;
        else if (rt == 'number' || rt == 'slider') q_response_rendered = <ProgressLine value={parseFloat(q_response)} total={10} min_color="#FC004E" />
      }
      return (
        <div className="col-sm-4" key={i}>
          <label>{ q.text }</label>
          {q_response_rendered}
        </div>
      );
    });
    return (
      <Paper style={{padding: "10px", marginTop: "8px"}}>

        <h3 style={{paddingTop: "0px", marginTop: "0px", display: 'inline-block'}}>{ journal.iso_date }</h3>
        <IconMenu className="pull-right" iconButtonElement={<IconButton iconClassName="material-icons">more_vert</IconButton>}>
          <MenuItem key="edit" primaryText="Edit" onClick={this.handle_edit_click.bind(this)} leftIcon={<FontIcon className="material-icons">edit</FontIcon>} />
        </IconMenu>

        <div className="row">
          { responses }
        </div>
      </Paper>
    )
  }
}
