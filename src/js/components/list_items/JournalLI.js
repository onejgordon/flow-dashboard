var React = require('react');
import {Paper, TextField,
  RaisedButton, FlatButton} from 'material-ui';
import {changeHandler} from 'utils/component-utils';
var ProgressLine = require('components/common/ProgressLine');


@changeHandler
export default class JournalLI extends React.Component {
  static propTypes = {
    journal: React.PropTypes.object,
    questions: []
  }

  static defaultProps = {
    journal: null,
  }

  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    let {journal, questions} = this.props;
    let data = journal.data;
    let responses = questions.map((q) => {
      let q_response = data[q.name];
      let q_response_rendered = "N/A";
      let rt = q.response_type;
      if (q_response != null) {
        if (rt == 'text') q_response_rendered = <div style={{fontFamily: 'monospace'}}>{q_response}</div>;
        else if (rt == 'number') q_response_rendered = <ProgressLine value={parseFloat(q_response)} total={10} />
      }
      return (
        <div className="col-sm-4">
          <label>{ q.text }</label>
          {q_response_rendered}
        </div>
      );
    });
    return (
      <Paper style={{padding: "10px"}}>
        <h3 style={{paddingTop: "0px", marginTop: "0px"}}>{ journal.iso_date }</h3>
        <div className="row">
          { responses }
        </div>
      </Paper>
    )
  }
}
