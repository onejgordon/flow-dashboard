var React = require('react');
import { RaisedButton, FlatButton, TextField,
  IconButton, Slider } from 'material-ui';
var MobileDialog = require('components/common/MobileDialog');
var api = require('utils/api');
var util = require('utils/util');
import {clone, cloneDeep} from 'lodash';
var AppConstants = require('constants/AppConstants');
var ProgressLine = require('components/common/ProgressLine');
import PropTypes from 'prop-types';
import {changeHandler} from 'utils/component-utils';

@changeHandler
export default class GoalViewer extends React.Component {
  static defaultProps = {
    goal_slots: AppConstants.GOAL_DEFAULT_SLOTS
  }

  static propTypes = {
    goal_slots: PropTypes.number
  }

  constructor(props) {
      super(props);
      this.state = {
          annual: null,
          monthly: null,
          longterm: null,
          set_goal_form: null,  // Which goal to show form for (date str or 'longterm')
          form: {},
          assessment_form: [],
          assessment_showing: null // 'month' or 'year'
      };
      this.ASSESS_LABELS = ["Very Poorly", "Poorly", "OK", "Well", "Very Well"];
      this.ASSESSMENT_DAY = 19; // 26;
      this.GOAL_M_FORMAT = "YYYY-MM";
      this.GOAL_M_LABEL_FORMAT = "MMM YYYY";
  }

  componentDidMount() {
    this.fetch_current();
  }

  handle_text_change(i, e) {
    let val = e.currentTarget.value;
    let {form} = this.state;
    form.text[i] = val;
    this.setState({form});
  }

  add_goal() {
    let {form} = this.state;
    form.text.push('');
    this.setState({form});
  }

  remove_goal(i) {
    let {form} = this.state;
    form.text.splice(i, 1);
    this.setState({form});
  }

  update_goal(params) {
    api.post("/api/goal", params, (res) => {
      let g = res.goal;
      let st = {assessment_showing: null};
      if (g.annual) st.annual = g;
      else if (g.monthly) st.monthly = g;
      else if (g.longterm) st.longterm = g;
      st.set_goal_form = null;
      this.setState(st);
    })
  }

  save_goals() {
    let params = clone(this.state.form)
    params.id = this.state.set_goal_form
    params.text = JSON.stringify(params.text)
    this.update_goal(params);
  }

  save_assessment(g) {
    let {assessment_form} = this.state;
    let params = {
      id: g.id,
      assessments: JSON.stringify(assessment_form)
    }
    this.update_goal(params);
  }

  handle_assessment_change(i, e, value) {
    let {assessment_form} = this.state;
    while (assessment_form.length <= i) {
      assessment_form.push(1);
    }
    assessment_form[i] = value;
    this.setState({assessment_form})
  }

  dismiss() {
    this.setState({set_goal_form: null, set_goal_label: null});
  }

  in_assessment_window(annual) {
    let today = new Date();
    let day_in_window = today.getDate() >= this.ASSESSMENT_DAY
    if (!annual) return day_in_window
    else return day_in_window && today.getMonth() == 11  // End of December
  }

  fetch_current() {
    api.get("/api/goal/current", {}, (res) => {
      let st = {annual: res.annual, monthly: res.monthly, longterm: res.longterm};
      this.setState(st);
    });
  }

  show_assessment(g) {
    let kind = g.annual ? 'annual' : 'monthly'
    let assessments = g.assessments || []
    if (assessments.length == 0 && g.text != 0) {
      for (let i=0; i<g.text.length; i++) {
        assessments.push(1)
      }
    }
    this.setState({assessment_showing: kind, assessment_form: assessments})
  }

  show_longterm() {
    if (this.state.longterm) this.show_goal_dialog(this.state.longterm, 'longterm');
    else this.setState({set_goal_form: 'longterm', set_goal_label: 'long term', form: {text: ['']}});
  }

  show_goal_dialog(g, type) {
      let today = new Date();
      let form = {};
      if (g) {
        form = cloneDeep(g);
      }
      if (!form.text) form.text = [''];
      let id, label;
      if (type == 'annual') id = today.getFullYear();
      else if (type == 'monthly') {
        let time = today.getTime();
        id = util.printDate(time, this.GOAL_M_FORMAT);
        label = util.printDate(time, this.GOAL_M_LABEL_FORMAT);
      }
      else if (type == 'longterm') id = 'longterm';
      let st = {
        form: form,
        set_goal_form: id,
        set_goal_label: label == null ? id : label
      };
      this.setState(st);
  }

  render_set_goal_form() {
    let {set_goal_form, form} = this.state;
    let goal_slots = Math.min(this.props.goal_slots, AppConstants.GOAL_MAX_SLOTS)
    if (set_goal_form) {
      let _inputs = form.text.map((t, i) => {
        return (
          <div className="row" key={i}>
            <div className="col-sm-11">
              <TextField
                placeholder={`Goal ${i+1}`} value={t || ''} name={"g"+i}
                onChange={this.handle_text_change.bind(this, i)}
                tabIndex={i+1}
                fullWidth autoFocus={t == null || t.length == 0} />
            </div>
            <div className="col-sm-1">
              <div className="center-block">
                <IconButton iconClassName="material-icons" tooltip="Remove Goal" tooltipPosition="bottom-left" onClick={this.remove_goal.bind(this, i)} tabIndex={null}>cancel</IconButton>
              </div>
            </div>
          </div>
        )
      })
      let can_add = form.text.length < goal_slots;
      let _add;
      if (can_add) _add = <FlatButton label="Add Goal" onClick={this.add_goal.bind(this)} tabIndex={form.text.length} />
      return (
        <div>
          { _inputs }
          { _add }
        </div>
      )
    } else return null;
  }

  render_goal(g, type) {
    let {assessment_form, assessment_showing} = this.state;
    let goal_list, create_prompt, assess_prompt
    let date_printed = "";
    let date = new Date();
    let value = 0;
    let total = 100;
    let this_assessment_showing = assessment_showing == type
    if (type == 'annual') {
      date_printed = date.getFullYear();
      value = util.dayOfYear(date);
      total = 365;
    } else {
      date_printed = util.printDate(date.getTime(), "MMMM YYYY")
      value = date.getDate();
      total = util.daysInMonth(date.getMonth()+1, date.getFullYear());
    }
    let in_assessment_window = g && this.in_assessment_window(g && g.annual)
    let not_yet_assessed = g && !g.assessment
    let action = not_yet_assessed ? "Create" : "Update"
    if (g) {
      let assess_goal_label = g.annual ? date.getFullYear() : "The month"
      assess_prompt = not_yet_assessed ? `${assess_goal_label} is almost over, how did you do?` : "Want to update your assessment?"
      goal_list = (
        <ul className="goalList">
          { g.text.map((txt, j) => {
            let _assessment
            let current_score = g.assessments[j]
            let val = assessment_form[j] || current_score;
            if (current_score != null) {
              txt = `${txt} [${current_score}/5]`
            }
            if (this_assessment_showing && in_assessment_window) _assessment = <Slider name='assessment'
                                                       value={val}
                                                       onChange={this.handle_assessment_change.bind(this, j)}
                                                       max={5} min={1} defaultValue={1} step={1} />

            return (
              <div key={j}>
                <li key={j}>{txt}</li>
                { _assessment }
              </div>
            )
          }) }
        </ul>
      );
    } else {
      create_prompt = (
        <div className="empty"><a href="javascript:void(0)" onClick={this.show_goal_dialog.bind(this, g, type)}>Set goals</a> for { date_printed }</div>
      )
    }
    return (
      <div className="goal col-sm-6" key={type}>
        <a href="javascript:void(0)" className="goalDate" onClick={this.show_goal_dialog.bind(this, g, type)}>{ date_printed }</a>
        <ProgressLine value={value} total={total} />

        { goal_list }
        { create_prompt }

        <div hidden={!in_assessment_window || this_assessment_showing}>
          <p className="lead">{ assess_prompt } <FlatButton label={`${action} ${type} assessment`} onClick={this.show_assessment.bind(this, g)} /></p>
        </div>
        <div hidden={!this_assessment_showing || !in_assessment_window}>
          <RaisedButton label={`Save Assessment`} onClick={this.save_assessment.bind(this, g)} primary={true} />
        </div>
      </div>
    )
  }

  render() {
    let {annual, monthly, set_goal_form, set_goal_label} = this.state;
    let goal_label;
    if (set_goal_label) goal_label = set_goal_label;
    let _goals = (
      <div className="row">
        { this.render_goal(monthly, 'monthly') }
        { this.render_goal(annual, 'annual') }
      </div>
    )
    let actions = [
      <RaisedButton label="Save Goals" onClick={this.save_goals.bind(this)} primary={true} />,
      <FlatButton label="Dismiss" onClick={this.dismiss.bind(this)} />
    ]
    return (
      <div className="GoalsViewer">
        <div className="row">
          <div className="col-sm-6">
            <h3>Goals</h3>
          </div>
          <div className="col-sm-6">
            <span className="pull-right"><IconButton tooltip="Longterm Goals" iconClassName="material-icons" onClick={this.show_longterm.bind(this)}>call_made</IconButton></span>
          </div>
        </div>

        { _goals }

        <MobileDialog open={set_goal_form != null}
                title={`Set ${goal_label} goals`}
                actions={actions}
                onRequestClose={this.dismiss.bind(this)}>
          { this.render_set_goal_form() }
        </MobileDialog>
      </div>
    )
  }
}
