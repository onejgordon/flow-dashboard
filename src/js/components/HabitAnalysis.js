var React = require('react');
import { Dialog, FlatButton } from 'material-ui';
var util = require('utils/util');
var api = require('utils/api');
import {changeHandler} from 'utils/component-utils';
import PropTypes from 'prop-types';
import {Doughnut} from "react-chartjs-2";
var AppConstants = require('constants/AppConstants');
var ReactTooltip = require('react-tooltip');
var BigProp = require('components/common/BigProp');

@changeHandler
export default class HabitAnalysis extends React.Component {
  static propTypes = {
    onDismiss: PropTypes.func,
    onEdit: PropTypes.func
  }
  static defaultProps = {
    habit: null,
    days: 60
  }
  constructor(props) {
      super(props);
      this.state = {
          habitdays: {}
      };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState) {
    let p_habit = prevProps.habit;
    let n_habit = this.props.habit;
    let habit_change = (!!p_habit != !!n_habit) ||
      (n_habit && n_habit.id != p_habit.id);
    if (habit_change) this.fetch_data();
  }

  dismiss() {
    this.props.onDismiss();
  }

  fetch_data() {
    let {habit} = this.props;
    if (habit) {
      api.get(`/api/habit/${habit.id}`, {with_days: this.props.days}, (res) => {
        // dict of ids to habit days (if present)
        this.setState({habitdays: util.lookupDict(res.habitdays, 'id')});
      });
    }
  }

  render_content() {
    let {habit, days} = this.props;
    let {habitdays} = this.state;
    let _squares = [];
    let cursor = new Date();
    cursor.setDate(cursor.getDate() - days);
    let longest_streak = 0;
    let streak = 0;
    let n_done = 0;
    let n_committed = 0;
    let n_committed_done = 0;
    let habit_color = habit.color || "#1193FE";
    for (let i = 0; i < days; i++) {
      cursor.setDate(cursor.getDate() + 1);
      let iso_date = util.printDateObj(cursor);
      let id = `habit:${habit.id}_day:${iso_date}`;
      let hd = habitdays[id];
      let day_st = {};
      let done = hd && hd.done;
      let even_month = cursor.getMonth() % 2 == 0;
      if (done) {
        streak += 1;
        n_done += 1;
      } else {
        if (streak > longest_streak) longest_streak = streak;
        streak = 0;
      }
      if (hd) {
        if (hd.done) day_st.backgroundColor = habit_color;
        if (hd.committed) {
          n_committed += 1;
          if (done) n_committed_done += 1;
          day_st.color = AppConstants.COMMIT_COLOR;
        }
      }
      let cls = "habitDay";
      if (even_month) cls += " even_month";
      _squares.push(<span className={cls} key={i} style={day_st} data-tip={iso_date}>{ cursor.getDate() }</span>)
    }
    let completion_rate = util.printPercent(n_done/days);
    let commitments_successful = `${n_committed_done} (${util.printPercent(n_committed_done/n_committed)})`;
    return (
      <div className="row">
        <div className="col-sm-6">
          <div className="habitCalendar" style={{marginTop: "10px"}}>
            { _squares }
          </div>
        </div>
        <div className="col-sm-6">
          <BigProp label="Longest streak" value={longest_streak} labelPosition="top" />
          <BigProp label={`Completions in last ${days} days`} value={n_done} labelPosition="top" />
          <BigProp label={`Commitments Successful`} value={commitments_successful} labelPosition="top" />

          <h5 className="text-center">Overall completion rate - { completion_rate }</h5>

          <div className="vpad">
            <Doughnut data={{
              labels: ["Days Completed", "Days Incomplete"],
              datasets: [
                {
                  data: [n_done, days - n_done],
                  backgroundColor: [habit_color, "#333333"]
                },

              ]
            }} />
          </div>
        </div>
      </div>
      )
  }

  handle_edit() {
    if (this.props.onEdit) this.props.onEdit(this.props.habit)
  }

  render() {
    let {habit} = this.props;
    let actions = [
      <FlatButton label="Edit" onClick={this.handle_edit.bind(this)} primary />,
      <FlatButton label="Dismiss" onClick={this.dismiss.bind(this)} />
    ];
    let content;
    if (habit) content = this.render_content()
    return (
      <Dialog
          open={!!habit}
          title={habit ? `Habit: ${habit.name}` : ""}
          autoScrollBodyContent={true}
          onRequestClose={this.dismiss.bind(this)}
          actions={actions}>

          <ReactTooltip place="top" effect="solid" />

          { content }

      </Dialog>
    )
  }
}
