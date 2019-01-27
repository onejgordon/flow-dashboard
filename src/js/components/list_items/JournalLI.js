var React = require('react');
import {Paper, IconButton} from 'material-ui';
import PropTypes from 'prop-types';
import {changeHandler} from 'utils/component-utils';
var ProgressLine = require('components/common/ProgressLine');

@changeHandler
export default class JournalLI extends React.Component {
  static propTypes = {
    journal: PropTypes.object,
    questions: PropTypes.array,
    onEditClick: PropTypes.func
  }

  static defaultProps = {
    questions: [],
    journal: null,
  }

  constructor(props) {
    super(props);
    this.state = {}
  }


  static getStores() {
    return [UserStore]
  }

  static getPropsFromStores() {
    return UserStore.getState()
  }

  handle_edit_click() {
    this.props.onEditClick();
  }

  render() {
    let {journal, questions} = this.props;
    let data = journal.data;
    let responses = questions.map((q, i) => {
      let q_response = data[q.name];
      let rt = q.response_type;
      let q_response_rendered = "N/A";
      let reverse = q.value_reverse || false;
      let min_color = reverse ? "#4FECF9" : "#FC004E"
      let color = reverse ? "#FC004E" : "#4FECF9"
      if (q_response != null) {
        if (rt == 'text' || rt == 'number_oe') q_response_rendered = <div style={{fontFamily: 'monospace'}}>{q_response}</div>;
        else if (rt == 'number' || rt == 'slider') q_response_rendered = <ProgressLine value={parseFloat(q_response)} total={10} color={color} min_color={min_color} />
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

        <h3 style={{paddingTop: "0px", marginTop: "0px", display: 'inline-block'}}>
          { journal.iso_date }
          <IconButton tooltip="Edit" onClick={this.handle_edit_click.bind(this)} iconClassName="material-icons">edit</IconButton>
        </h3>


        <div className="row">
          { responses }
        </div>
      </Paper>
    )
  }
}
