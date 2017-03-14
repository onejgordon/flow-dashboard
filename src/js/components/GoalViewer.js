var React = require('react');
import { Dialog, RaisedButton, FlatButton, TextField, Slider } from 'material-ui';
var api = require('utils/api');
var util = require('utils/util');
import {clone} from 'lodash';
var ProgressLine = require('components/common/ProgressLine');
import {changeHandler} from 'utils/component-utils';

@changeHandler
export default class GoalViewer extends React.Component {
  static defaultProps = {

  }
  constructor(props) {
      super(props);
      this.state = {
          annual: null,
          monthly: null,
          set_goal_form: null,  // Which goal to show form for (date str)
          form: {},
          assessment_form: {assessment: 1}
      };
      this.ASSESS_LABELS = ["Very Poorly", "Poorly", "OK", "Well", "Very Well"];
      this.ASSESSMENT_DAY = 26;
      this.GOAL_M_FORMAT = "YYYY-MM";
  }

  componentDidMount() {
    this.fetch_current();
  }

  update_goal(params) {
    api.post("/api/goal", params, (res) => {
      let g = res.goal;
      let st = {};
      if (g.annual) st.annual = g;
      else st.monthly = g;
      st.set_goal_form = null;
      this.setState(st);
    })
  }

  save_goals() {
    let params = clone(this.state.form);
    params.id = this.state.set_goal_form;
    this.update_goal(params);
  }

  save_assessment(g) {
    let {assessment_form} = this.state;
    let params = {
      id: g.id,
      assessment: assessment_form.assessment
    }
    this.update_goal(params);
  }

  dismiss() {
    this.setState({set_goal_form: null});
  }

  in_assessment_window() {
    let today = new Date();
    return today.getDate() >= this.ASSESSMENT_DAY;
  }

  fetch_current() {
    api.get("/api/goal/current", {}, (res) => {
      let today = new Date();
      let st = {annual: res.annual, monthly: res.monthly};
      if (!res.annual) st.set_goal_form = today.getFullYear();
      else if (!res.monthly) st.set_goal_form = util.printDate(today.getTime(), this.GOAL_M_FORMAT);
      this.setState(st);
    });
  }

  show_goal_dialog(g) {
      let today = new Date();
      let form = util.spread_array(g, 'text', 'text', 4);
      console.log(form);
      let st = {
        form: form
      };
      if (g.annual) st.set_goal_form = today.getFullYear();
      else st.set_goal_form = util.printDate(today.getTime(), this.GOAL_M_FORMAT);
      this.setState(st);
  }

  render_set_goal_form() {
    let {set_goal_form, form} = this.state;
    if (set_goal_form) {
      let _inputs = [1,2,3,4].map((idx) => {
        let key = 'text' + (idx);
        return <TextField key={key} name={key} placeholder={`Goal ${idx}`} value={form[key] || ''} onChange={this.changeHandler.bind(this, 'form', key)} fullWidth />
      });
      return (
        <div>
          { _inputs }
        </div>
      )
    } else return null;
  }

  render_goal(g) {
    if (!g) return null;
    let {assessment_form} = this.state;
    let today = new Date();
    let date_printed = "";
    let pct = 0.0;
    let date = new Date(g.iso_date);
    let value = 0;
    let total = 100;
    if (g.annual) {
      date_printed = g.id;
      value = util.dayOfYear(today);
      total = 365;
      pct = 100.0 * ((today.getMonth()+1) / 12.0 + today.getDate() / 30.0 / 12.0 ); // Imprecise
    } else {
      date_printed = util.printDate(date.getTime(), "MMM YYYY");
      value = today.getDate();
      total = util.daysInMonth(date.getMonth()+1, date.getFullYear());
    }
    let show_assessment = this.in_assessment_window() && !g.annual && !g.assessment;
    let assess_label = this.ASSESS_LABELS[(assessment_form.assessment-1)];
    return (
      <div className="goal col-sm-6" key={g.id}>
        <div className="goalDate" onClick={this.show_goal_dialog.bind(this, g)}>{ date_printed }</div>
        <ProgressLine value={value} total={total} />

        <ul className="goalList">
          { g.text.map((txt, j) => {
            return <li key={j}>{txt}</li>
          }) }
        </ul>

        <div hidden={!show_assessment}>
          <p className="lead">How&apos;d you do?</p>

          <Slider name='assessment' value={assessment_form.assessment} onChange={this.changeHandlerSlider.bind(this, 'assessment_form', 'assessment')} max={5} min={1} defaultValue={1} step={1} />
          <RaisedButton label={`Submit Assessment (${assess_label})`} onClick={this.save_assessment.bind(this, g)} primary={true} />
        </div>
      </div>
    );
  }

  render() {
    let _goals;
    let {annual, monthly, set_goal_form} = this.state;
    if (annual || monthly) _goals = (
      <div className="row">
      { [monthly, annual].map((g, i) => {
        return this.render_goal(g);
      }) }
      </div>
    )
    let actions = [
      <RaisedButton label="Save Goals" onClick={this.save_goals.bind(this)} primary={true} />,
      <FlatButton label="Later" onClick={this.dismiss.bind(this)} />
    ]
    return (
      <div className="GoalsViewer">
        <h3>Goals</h3>
        { _goals }

        <Dialog open={set_goal_form != null} title={`Set goals for ${set_goal_form}`} actions={actions} onRequestClose={this.dismiss.bind(this)}>
          { this.render_set_goal_form() }
        </Dialog>
      </div>
    )
  }
}
