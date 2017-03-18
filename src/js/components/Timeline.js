var React = require('react');
import {Link} from 'react-router';
var api = require('utils/api');
import {Drawer, AppBar, IconButton, FlatButton, RaisedButton,
    List, ListItem, TextField, Dialog} from 'material-ui';
import {clone} from 'lodash';
var ReactLifeTimeline = require('react-life-timeline');
import connectToStores from 'alt-utils/lib/connectToStores';
import {changeHandler} from 'utils/component-utils';

@connectToStores
@changeHandler
export default class Timeline extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
        this.state = {
            events: [],
            event_list_open: false,
            editing_index: null,
            form: null
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
    }

    fetch_events() {
      api.get("/api/event", {}, (res) => {
        this.setState({events: res.events}, () => {
            this.refs.rlt.got_events(res.events);
        });
      });
    }

    edit_event(e, i) {
        this.setState({editing_index: i, form: clone(e)});
    }

    render_events() {
        let {events} = this.state;
        return events.map((e, i) => {
            let date_range = e.date_start;
            if (e.date_end && e.date_end != e.date_start) date_range += " - " + e.date_end;
            return <ListItem
                        key={i}
                        primaryText={e.title}
                        secondaryText={date_range}
                        onClick={this.edit_event.bind(this, e, i)} />
        });
    }

    render_edit_form() {
        let {editing_index, form} = this.state;
        if (editing_index != null) return (
            <div>
                <TextField floatingLabelText="Title" name="title" value={form.title||''} onChange={this.changeHandler.bind(this, 'form', 'title')} fullWidth />
                <TextField floatingLabelText="Details" name="details" value={form.details||''} onChange={this.changeHandler.bind(this, 'form', 'details')} fullWidth />
                <TextField floatingLabelText="Color (hex)" name="color" value={form.color||''} onChange={this.changeHandler.bind(this, 'form', 'color')} fullWidth />
                <TextField floatingLabelText="Date Start" name="date_start" value={form.date_start||''} onChange={this.changeHandler.bind(this, 'form', 'date_start')} fullWidth />
                <TextField floatingLabelText="Date End (optional)" name="date_end" value={form.date_end||''} onChange={this.changeHandler.bind(this, 'form', 'date_end')} fullWidth />
            </div>
            )
    }

    save_event() {
        let params = clone(this.state.form);
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
        let DOB = this.props.user.birthday;
        if (!DOB) return <div className="empty">Set your birthday and add events on the <Link to="/app/manage">manage</Link> page.</div>;
        let events = this.state.events;
        return (
            <div>

                <Dialog title="Edit Event"
                    open={this.state.editing_index != null}
                    actions={[<RaisedButton label="Save" onClick={this.save_event.bind(this)} primary={true} />]}
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
                    <FlatButton label="New Event" onTouchTap={this.new_event.bind(this)} />
                </div>

                <h2>Timeline</h2>

                <h4>Weeks</h4>

                <ReactLifeTimeline
                    ref="rlt"
                    events={events}
                    birthday={new Date(DOB)} />

            </div>
        );
    }
};

module.exports = Timeline;
