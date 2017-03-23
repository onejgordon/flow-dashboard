var React = require('react');

var UserStore = require('stores/UserStore');
var ReadableLI = require('components/list_items/ReadableLI');
import {Tabs, Tab, Toggle,
    IconMenu, ListItem} from 'material-ui';
var util = require('utils/util');
import connectToStores from 'alt-utils/lib/connectToStores';
import {changeHandler} from 'utils/component-utils';
import {clone} from 'lodash';
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
                with_notes: false
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

    render_quote(q) {
        return <ListItem primaryText={util.truncate(q.content(60))} />
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

    render() {
        let {form} = this.state;
        let readable_params = {};
        if (form.favorites) readable_params.favorites = 1;
        if (form.with_notes) readable_params.with_notes = 1;
        return (
            <div>

                <h1>Reading</h1>

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

                    <Tab label="Quotes">
                        <FetchedList ref="quotes" url="/api/quote"
                            listStyle="mui" listProp="quotes"
                            renderItem={this.render_quote.bind(this)}
                            paging_enabled={true}
                            autofetch={false}/>
                    </Tab>
                </Tabs>

            </div>
        );
    }
};

module.exports = Reading;
