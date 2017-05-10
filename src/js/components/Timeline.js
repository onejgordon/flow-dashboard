var React = require('react');
var api = require('utils/api');
var UserActions = require('actions/UserActions');
import {Drawer, AppBar, IconButton, FlatButton, RaisedButton,
    List, ListItem, TextField, Dialog, DatePicker, Toggle} from 'material-ui';
import {clone} from 'lodash';
var ReactLifeTimeline = require('react-life-timeline');
import connectToStores from 'alt-utils/lib/connectToStores';
import {changeHandler} from 'utils/component-utils';
import { SwatchesPicker } from 'react-color';
var util = require('utils/util');

@connectToStores
@changeHandler
class Timeline extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
        this.state = {
            events: [],
            event_list_open: false,
            editing_index: null,
            form: {}
        };
    }

    static getStores() {
        return [];
    }

    static getPropsFromStores() {
        return {};
    }

    componentDidMount() {
        this.fetch_events();
        util.set_title("Timeline");
    }

    save_birthday() {
        let {form} = this.state;
        if (form.birthday) UserActions.update({birthday: util.printDateObj(form.birthday)});
    }

    fetch_events() {
      api.get("/api/event", {}, (res) => {
        this.setState({events: res.events}, () => {
            if (this.refs.rlt) this.refs.rlt.got_events(res.events);
        });
      });
    }

    edit_event(e, i) {
        let form = clone(e);
        if (form.date_start) form.date_start = new Date(form.date_start);
        if (form.date_end) form.date_end = new Date(form.date_end);
        this.setState({editing_index: i, form: form});
    }

    color_change(color) {
        let {form} = this.state;
        form.color = color.hex;
        this.setState({form});
    }

    render_events() {
        let {events} = this.state;
        return events.map((e, i) => {
            let date_range = e.date_start;
            if (e.ongoing) date_range += ` (ongoing)`;
            else if (e.date_end && e.date_end != e.date_start) date_range += " - " + e.date_end;
            return <ListItem
                        key={i}
                        primaryText={e.title}
                        secondaryText={<span style={{color: e.color || "#CCC"}}>{date_range}</span>}
                        onClick={this.edit_event.bind(this, e, i)} />
        });
    }

    render_edit_form() {
        let {editing_index, form} = this.state;
        if (editing_index != null) return (
            <div>
                <TextField floatingLabelText="Title" name="title" value={form.title||''} onChange={this.changeHandler.bind(this, 'form', 'title')} fullWidth />
                <TextField floatingLabelText="Details" name="details" value={form.details||''} onChange={this.changeHandler.bind(this, 'form', 'details')} fullWidth />
                <div className="row">
                    <div className="col-sm-6">
                        <label>Event Color (optional)</label>
                        <SwatchesPicker width="100%" height={200} display={true} color={form.color || ""} onChangeComplete={this.color_change.bind(this)} />
                    </div>
                    <div className="col-sm-6">
                        <DatePicker autoOk={true} floatingLabelText="Date Start" formatDate={util.printDateObj} value={form.date_start||''} onChange={this.changeHandlerNilVal.bind(this, 'form', 'date_start')} />
                        <DatePicker autoOk={true} floatingLabelText="Date End (optional)" formatDate={util.printDateObj} value={form.date_end||''} onChange={this.changeHandlerNilVal.bind(this, 'form', 'date_end')} />
                        <Toggle toggled={form.ongoing} onToggle={this.changeHandlerToggle.bind(this, 'form', 'ongoing')} label="Ongoing" labelPosition="right" />
                    </div>
                </div>
            </div>
            )
    }

    save_event() {
        let params = clone(this.state.form);
        if (params.date_start) params.date_start = util.printDateObj(params.date_start);
        if (params.date_end) params.date_end = util.printDateObj(params.date_end);
        api.post("/api/event", params, (res) => {
            // Update events list
            let events = this.state.events;
            let {editing_index} = this.state;
            if (editing_index >= 0) events[editing_index] = res.event;
            else events.push(res.event);
            this.setState({editing_index: null, form: {}, events: events}, () => {
                this.refs.rlt.got_events(events);
            });
        });
    }

    new_event() {
        this.setState({form: {}, editing_index: -1});
    }

    render() {
        let {form} = this.state;
        let {user} = this.props;
        if (!user) return <div></div>
        let DOB = this.props.user.birthday;
        let today = new Date();
        if (!DOB) return (
            <div>
                <div className="empty">
                    To populate your timeline, first enter your birthday.

                    <DatePicker autoOk={true}
                        floatingLabelText="Birthday"
                        formatDate={util.printDateObj}
                        maxDate={today}
                        value={form.birthday} onChange={this.changeHandlerNilVal.bind(this, 'form', 'birthday')}/>

                </div>
                <div className="text-center">
                    <RaisedButton primary={true} label="Save Birthday" onClick={this.save_birthday.bind(this)} disabled={form.birthday == null} />
                </div>
            </div>
        );
        let events = this.state.events;
        let dialog_actions = [
            <RaisedButton label="Save" onClick={this.save_event.bind(this)} primary={true} />,
            <FlatButton label="Cancel" onClick={this.setState.bind(this, {editing_index: null})} />
        ]
        return (
            <div>

                <Dialog title="Add / Edit Event"
                    open={this.state.editing_index != null}
                    actions={dialog_actions}
                    autoDetectWindowHeight={true} autoScrollBodyContent={true}
                    onRequestClose={this.setState.bind(this, {editing_index: null})} >
                    { this.render_edit_form() }
                </Dialog>

                <Drawer docked={false} width={300} open={this.state.event_list_open} onRequestChange={this.setState.bind(this, {event_list_open: false})} openSecondary={true} >
                  <AppBar
                    title="Events"
                    zDepth={0}
                    iconElementRight={<IconButton iconClassName="material-icons">close</IconButton>}
                    onRightIconButtonTouchTap={this.setState.bind(this, {event_list_open: false})} />
                    <List>
                      { this.render_events() }
                    </List>
                </Drawer>

                <div className="pull-right">
                    <FlatButton label="Show Event List" onTouchTap={this.setState.bind(this, {event_list_open: true})} />
                    <RaisedButton label="New Event" onTouchTap={this.new_event.bind(this)} primary={true} />
                </div>

                <h2>Timeline</h2>

                <h4>Weeks</h4>

                <ReactLifeTimeline
                    ref="rlt"
                    events={events}
                    birthday={util.date_from_iso(DOB)} />

            </div>
        );
    }
}

export default Timeline;
