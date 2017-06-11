var React = require('react');
var util = require('utils/util');
import {changeHandler} from 'utils/component-utils';
import {clone, isEqual} from 'lodash';
var FetchedList = require('components/common/FetchedList');
import {DatePicker, Paper, ListItem} from 'material-ui'

@changeHandler
export default class TrackingHistory extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
        let init_to = new Date()
        let init_from = new Date()
        init_from.setDate(init_from.getDate() - 7)
        this.state = {
            form: {
                date_from: init_from,
                date_to: init_to,
            },
        };
    }

    componentDidMount() {
        util.set_title("Tracking History");
    }

    componentDidUpdate(prevProps, prevState) {
        let filter_change = !isEqual(prevState.form, this.state.form)
        if (filter_change) this.refs.tds.refresh();
    }

    render_td(td) {
        let pt = td.iso_date
        let st = []
        Object.keys(td.data).map((key) => {
            let val = td.data[key];
            st.push(<span><b>{key}:</b> {val}</span>)
        })
        return <ListItem primaryText={pt} secondaryText={st} />
    }

    render() {
        let {form} = this.state;
        let params = clone(form);
        if (form.date_from) params.date_from = util.printDateObj(form.date_from);
        if (form.date_to) params.date_to = util.printDateObj(form.date_to);
        return (
            <div>

                <h1>Tracking History</h1>

                <Paper style={{padding: 10}}>
                    <div className="row">
                        <div className="col-sm-6">
                            <DatePicker autoOk={true}
                                floatingLabelText="Before Date"
                                formatDate={util.printDateObj}
                                value={form.date_from}
                                onChange={this.changeHandlerNilVal.bind(this, 'form', 'date_from')} />
                        </div>
                        <div className="col-sm-6">
                            <DatePicker autoOk={true}
                                floatingLabelText="Until Date"
                                formatDate={util.printDateObj}
                                value={form.date_to}
                                onChange={this.changeHandlerNilVal.bind(this, 'form', 'date_to')} />
                        </div>
                    </div>
                </Paper>

                <FetchedList ref="tds"
                            url="/api/tracking"
                            params={params}
                            listProp="tracking_days"
                            per_page={30}
                            listStyle="mui"
                            renderItem={this.render_td.bind(this)}
                            autofetch={true}
                            paging_enabled={true} />

            </div>
        );
    }
}

module.exports = TrackingHistory;
