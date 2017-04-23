var React = require('react');
import {Link} from 'react-router';
var UserStore = require('stores/UserStore');
var ReadingDetail = require('components/ReadingDetail');
var ReadableLI = require('components/list_items/ReadableLI');
var QuoteLI = require('components/list_items/QuoteLI');
import {Tabs, Tab, RadioButton, RadioButtonGroup, Paper, RaisedButton, TextField,
    ListItem, DropDownMenu, MenuItem, FlatButton, Dialog} from 'material-ui';
var util = require('utils/util');
import connectToStores from 'alt-utils/lib/connectToStores';
import {changeHandler} from 'utils/component-utils';
import {clone} from 'lodash';
var api = require('utils/api');
var FetchedList = require('components/common/FetchedList');
var toastr = require('toastr');

@connectToStores
@changeHandler
export default class Reading extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
        this.state = {
            form: {
                reading_filter: 'favorites',
                quotes: '',
                readings: ''
            },
            reading_detail: null,
            samples: {},
            random_showing: null,
            random_type_showing: null
        };
    }

    static getStores() {
        return [UserStore];
    }

    static getPropsFromStores() {
        return UserStore.getState();
    }

    componentDidMount() {
        util.set_title("Reading");
    }

    maybe_refresh_quotes() {
        if (this.refs.quotes && this.refs.quotes.empty()) this.refs.quotes.refresh();
    }


    pick_sample(items, type) {
        let st = {};
        let idx = parseInt(Math.random() * items.length) - 1;
        let item = items[idx];
        st.random_showing = item;
        st.random_type_showing = type;
        return st;
    }

    get_random(type) {
        let items = this.state.samples[type] || [];
        if (items.length == 0) {
            api.get(`/api/${type}/random`, {}, (res) => {
                let list_prop = type + 's';
                let {samples} = this.state;
                samples[type] = res[list_prop];
                let st = this.pick_sample(samples[type], type);
                st.samples = samples;
                this.setState(st);
            });
        } else {
            // Already have samples of this type, choose one randomly
            this.setState(this.pick_sample(items, type));
        }
    }

    dismiss_dialog() {
        this.setState({random_showing: null, random_type_showing: null});
    }

    upload_quotes() {
        let {form} = this.state;
        if (form.quotes.length > 0 && form.quotes[0] == '[') {
            let params = {quotes: form.quotes};
            api.post("/api/quote/batch", params);
        } else toastr.error("Malformed or empty? Must be JSON array");
    }

    upload_readings() {
        let {form} = this.state;
        if (form.readings.length > 0 && form.readings[0] == '[') {
            let params = {readings: form.readings, source: 'form'};
            api.post("/api/readable/batch", params);
        } else toastr.error("Malformed or empty? Must be JSON array");
    }

    set_readable_detail(r) {
        this.setState({reading_detail: r});
    }

    render_quote(q) {
        return <QuoteLI key={q.id} quote={q} />
    }

    readable_update(r) {
        this.refs.readables.update_item_by_key(r, 'id');
    }

    readable_delete(r) {
        this.refs.readables.update_item_by_key(r, 'id', true);
    }

    render_readable(r) {
        return <ReadableLI key={r.id} readable={r}
                  onItemClick={this.set_readable_detail.bind(this)}
                  onUpdate={this.readable_update.bind(this)}
                  onDelete={this.readable_delete.bind(this)} />
    }

    create_quote() {
        let params = clone(this.state.form);
        api.post("/api/quote", params, (res) => {
            if (res.quote) this.refs.quotes.update_item_by_key(res.quote, 'id');
            this.setState({form: {}});
        });
    }

    create_reading() {
        let params = clone(this.state.form);
        params.source = 'form';
        api.post("/api/readable", params, (res) => {
            if (res.readable) this.refs.readables.update_item_by_key(res.readable, 'id');
            this.setState({form: {}});
        });
    }

    render_random_item_dialog() {
        let {random_showing, random_type_showing} = this.state;
        let title = "", content = "";
        let open = random_showing != null;
        let item = random_showing;
        if (item) {
            if (random_type_showing == 'readable') {
                title = `${item.title} (${item.author})`;
                content = <span><b>Notes:</b> {item.notes}</span>
            } else if (random_type_showing == 'quote') {
                title = item.source;
                content = <span style={{fontFamily: "Georgia"}}>&ldquo;{item.content}&rdquo;</span>
            }
        }
        return (
            <Dialog title={title} open={open} onRequestClose={this.dismiss_dialog.bind(this)} autoScrollBodyContent={true}>
                <p className="lead" style={{fontSize: "1.3em", marginTop: "10px"}}>{ content }</p>
            </Dialog>
        );
    }

    render() {
        let {form, reading_detail} = this.state;
        let readable_params = {};
        if (form.reading_filter) readable_params[form.reading_filter] = 1;
        return (
            <div>

                <h1>Reading</h1>

                <p className="lead">
                    View all saved reading material here. You can integrate Flow with Goodreads and Pocket to capture
                    books and articles from the web. You can also integrate with Evernote to capture saved excerpts & quotes.
                    Set up <Link to="/app/integrations">integrations</Link>.
                </p>

                <div className="pull-right">
                    <FlatButton label="Random Quote" onClick={this.get_random.bind(this, 'quote')} />
                    <FlatButton label="Random Reading Notes" onClick={this.get_random.bind(this, 'readable')} />
                </div>

                <ReadingDetail readable={reading_detail} onDismiss={this.setState.bind(this, {reading_detail: null})} />

                <Tabs>
                    <Tab label="Reading">

                        <div className="vpad">
                            <RadioButtonGroup name="filter" onChange={this.changeHandlerEventValue.bind(this, 'form', 'reading_filter')} valueSelected={form.reading_filter}>
                                <RadioButton value="favorites" label="Favorites" />
                                <RadioButton value="with_notes" label="With Notes" />
                                <RadioButton value="read" label="Read" />
                                <RadioButton value="unread" label="Unread" />
                            </RadioButtonGroup>
                        </div>
                        <FetchedList ref="readables" params={readable_params} url="/api/readable"
                            listStyle="mui" listProp="readables"
                            per_page={20}
                            renderItem={this.render_readable.bind(this)}
                            fts_url="/api/readable/search"
                            fts_prop="readables"
                            paging_enabled={true}
                            autofetch={true}/>

                        <Paper style={{padding: "10px"}}>
                            <h3>Save New Book / Article</h3>
                            <DropDownMenu value={form.type || 1} onChange={this.changeHandlerDropDown.bind(this, 'form', 'type')}>
                                <MenuItem value={1} primaryText="Article" />
                                <MenuItem value={2} primaryText="Book" />
                                <MenuItem value={3} primaryText="Paper" />
                            </DropDownMenu>
                            <TextField placeholder="Title" name="title" value={form.title||''} onChange={this.changeHandler.bind(this, 'form', 'title')} fullWidth />
                            <TextField placeholder="Author" name="author" value={form.author||''} onChange={this.changeHandler.bind(this, 'form', 'author')} fullWidth />
                            <TextField placeholder="Link (URL, optional)" name="url" value={form.url||''} onChange={this.changeHandler.bind(this, 'form', 'url')} fullWidth />
                            <TextField placeholder="Notes (optional)" name="notes" value={form.notes||''} onChange={this.changeHandler.bind(this, 'form', 'notes')} fullWidth />
                            <RaisedButton label="Create" onClick={this.create_reading.bind(this)} />
                        </Paper>

                        <div style={{margin: "10px"}}>
                            <label>Batch Upload from JSON array</label>
                            <p>Each JSON object should include properties: <code>type</code> ('article', 'book', or 'paper'), <code>title</code>, and <code>source</code>. Optional properties: <code>tags</code> (array), <code>image_url</code>, <code>author</code>, and <code>notes</code>.</p>
                            <TextField placeholder="Readings (JSON)" name="readings" value={form.readings} onChange={this.changeHandler.bind(this, 'form', 'readings')} multiLine={true} fullWidth />
                            <RaisedButton label="Batch Upload from JSON" onClick={this.upload_readings.bind(this)} />
                        </div>
                    </Tab>

                    <Tab label="Quotes & Excerpts" onActive={this.maybe_refresh_quotes.bind(this)}>
                        <FetchedList ref="quotes"
                            url="/api/quote"
                            listStyle="mui" listProp="quotes"
                            per_page={20}
                            fts_url="/api/quote/search"
                            fts_prop="quotes"
                            renderItem={this.render_quote.bind(this)}
                            paging_enabled={true}
                            autofetch={false}/>

                        <Paper style={{padding: "10px"}}>
                            <h3>Save Quote</h3>
                            <TextField placeholder="Source" name="source" value={form.source||''} onChange={this.changeHandler.bind(this, 'form', 'source')} fullWidth />
                            <TextField placeholder="Content" name="content" value={form.content||''} onChange={this.changeHandler.bind(this, 'form', 'content')} fullWidth multiLine />
                            <TextField placeholder="Link (URL, optional)" name="link" value={form.link||''} onChange={this.changeHandler.bind(this, 'form', 'link')} fullWidth />
                            <TextField placeholder="Tags (comma separated)" name="tags" value={form.tags||''} onChange={this.changeHandler.bind(this, 'form', 'tags')} fullWidth />
                            <RaisedButton label="Create" onClick={this.create_quote.bind(this)} />
                        </Paper>

                        <div style={{margin: "10px"}}>
                            <label>Batch Upload from JSON array</label>
                            <p>Each JSON object should include properties: <code>source</code> and <code>content</code>. Optional properties: <code>tags</code> (array), <code>dt_added</code> (ISO date), <code>location</code>, and <code>link</code>.</p>
                            <TextField placeholder="Quotes (JSON)" name="quotes" value={form.quotes} onChange={this.changeHandler.bind(this, 'form', 'quotes')} multiLine={true} fullWidth />
                            <RaisedButton label="Batch Upload from JSON" onClick={this.upload_quotes.bind(this)} />
                        </div>

                    </Tab>
                </Tabs>

                { this.render_random_item_dialog() }

            </div>
        );
    }
};

module.exports = Reading;
