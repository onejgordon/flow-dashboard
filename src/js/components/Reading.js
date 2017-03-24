var React = require('react');
import {Link} from 'react-router';
var UserStore = require('stores/UserStore');
var ReadableLI = require('components/list_items/ReadableLI');
import {Tabs, Tab, Toggle, Paper, RaisedButton, TextField,
    ListItem} from 'material-ui';
var util = require('utils/util');
import connectToStores from 'alt-utils/lib/connectToStores';
import {changeHandler} from 'utils/component-utils';
import {clone} from 'lodash';
var api = require('utils/api');
var FetchedList = require('components/common/FetchedList');

@connectToStores
@changeHandler
export default class Reading extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
        this.state = {
            form: {
                favorites: false,
                with_notes: false,
                quotes: ''
            }
        };
    }

    static getStores() {
        return [UserStore];
    }

    static getPropsFromStores() {
        return UserStore.getState();
    }

    componentDidMount() {
    }

    upload_quotes() {
        let {form} = this.state;
        let params = {quotes: form.quotes};
        api.post("/api/quote/batch", params);
    }

    render_quote(q) {
        let subs = [q.source];
        if (q.location) subs.push(q.location);
        let sec = subs.join(' | ');
        return <ListItem primaryText={util.truncate(q.content, 120)}
                secondaryText={sec} />
    }

    readable_update(r) {
        this.refs.readables.update_item_by_key(r, 'id');
    }

    readable_delete(r) {
        this.refs.readables.update_item_by_key(r, 'id', true);
    }

    render_readable(r) {
        return <ReadableLI key={r.id} readable={r}
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

    render() {
        let {form} = this.state;
        let readable_params = {};
        if (form.favorites) readable_params.favorites = 1;
        if (form.with_notes) readable_params.with_notes = 1;
        return (
            <div>

                <h1>Reading</h1>

                <p className="lead">
                    View all saved reading material here. You can integrate Flow with Goodreads and Pocket to capture
                    books and articles from the web. You can also integrate with Evernote to capture saved excerpts & quotes.
                    Set up <Link to="/app/integrations">integrations</Link>.
                </p>

                <Tabs>
                    <Tab label="Reading">

                        <div className="vpad">
                            <Toggle label="Favorites" labelPosition="right" toggled={form.favorites} onToggle={this.changeHandlerToggle.bind(this, 'form', 'favorites')} />
                            <Toggle label="With Notes" labelPosition="right" toggled={form.with_notes} onToggle={this.changeHandlerToggle.bind(this, 'form', 'with_notes')} />
                        </div>
                        <FetchedList ref="readables" params={readable_params} url="/api/readable"
                            listStyle="mui" listProp="readables"
                            renderItem={this.render_readable.bind(this)}
                            paging_enabled={true}
                            autofetch={true}/>
                    </Tab>

                    <Tab label="Quotes & Excerpts">
                        <FetchedList ref="quotes" url="/api/quote"
                            listStyle="mui" listProp="quotes"
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
                            <TextField placeholder="Quotes (JSON)" name="quotes" value={form.quotes} onChange={this.changeHandler.bind(this, 'form', 'quotes')} multiLine={true} fullWidth />
                            <RaisedButton label="Batch Upload from JSON" onClick={this.upload_quotes.bind(this)} />
                        </div>


                    </Tab>
                </Tabs>

            </div>
        );
    }
};

module.exports = Reading;
