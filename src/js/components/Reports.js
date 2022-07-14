var React = require('react');

var UserStore = require('stores/UserStore');
import {RaisedButton, Tabs, Tab, FontIcon, DatePicker,
    IconMenu, ListItem, MenuItem, IconButton, Checkbox} from 'material-ui';
var api = require('utils/api');
var util = require('utils/util');
import connectToStores from 'alt-utils/lib/connectToStores';
import {changeHandler} from 'utils/component-utils';
import {clone} from 'lodash';
var FetchedList = require('components/common/FetchedList');
import {findItemById} from 'utils/store-utils';

@connectToStores
@changeHandler
export default class Reports extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
        let d = new Date();
        d.setDate(d.getDate() - 7);
        this.state = {
            form: {
                start: d,
                dont_normalize_to_ascii: false
            }
        };
        this.REPORT_DONE = 3;
        this.REPORT_STATUSES = [
            { value: 1, label: "Created" },
            { value: 2, label: "Generating" },
            { value: 3, label: "Done" },
            { value: 4, label: "Cancelled" },
            { value: 5, label: "Error" }
        ];
    }

    static getStores() {
        return [UserStore];
    }

    static getPropsFromStores() {
        return UserStore.getState();
    }

    componentDidMount() {
        util.set_title("Reports");
    }

    generate_report(type_int) {
        var specs = clone(this.state.form);
        if (specs.start) specs.start = specs.start.getTime();
        if (specs.end) specs.end = specs.end.getTime();
        specs.dont_normalize_to_ascii = specs.dont_normalize_to_ascii ? 1 : 0
        var data = {
            type: type_int,
            specs_json: JSON.stringify(specs)   
        }
        api.post("/api/report/generate", data, function(res) {
        })
      }

    delete(r) {
        api.post("/api/report/delete", {rid: r.id}, (res) => {
          this.refs.list.remove_item_by_key(r.key, 'key');
        });
    }

    download(r) {
        if (r.serve_url && r.status == 3) window.open(r.serve_url,'_blank');
    }

    render_report(r) {
        let _download;
        if (r.status == this.REPORT_DONE) _download = <a href="javascript:void(0)" onClick={this.download.bind(this, r)}>Download</a>;
        var status_text = findItemById(this.REPORT_STATUSES, r.status, 'value').label;
        let _menu = (
            <IconMenu iconButtonElement={<IconButton iconClassName="material-icons">more_vert</IconButton>}>
              <MenuItem key="gr" leftIcon={<FontIcon className="material-icons">delete</FontIcon>} primaryText="Delete" onClick={this.delete.bind(this, r)} />
              <MenuItem key="po" leftIcon={<FontIcon className="material-icons">file_download</FontIcon>} primaryText="Download" onClick={this.download.bind(this, r)} />
            </IconMenu>
        )
        return (
          <ListItem
            primaryText={r.title}
            secondaryText={status_text}
            rightIconButton={_menu}
            onTouchTap={this.download.bind(this, r)} />
          )
    }

    render_date_form() {
        let {form} = this.state;
        return (
            <div className="row">
              <div className="col-sm-6">
                <DatePicker onChange={this.changeHandlerNilVal.bind(this, 'form', 'start')} value={form.start} autoOk={true} hintText="From" />
              </div>
              <div className="col-sm-6">
                <DatePicker onChange={this.changeHandlerNilVal.bind(this, 'form', 'end')} value={form.end} autoOk={true} hintText="End" />
              </div>
              <div className="col-sm-6">
                <Checkbox onCheck={this.changeHandlerNilVal.bind(this, 'form', 'dont_normalize_to_ascii')} checked={form.dont_normalize_to_ascii} label="Don't normalize to ascii" />
                <label>Advanced: don't normalize to ascii (keep unchecked unless exporting non-standard characters)</label>
              </div>
            </div>
        )
    }

    render() {
        let {form} = this.state;
        return (
            <div>

                <h1>Exports</h1>

                <p className="lead">Flow stores exports for 30 days, but they can be re-generated at any time.</p>

                <FetchedList ref="list" url="/api/report" listStyle="mui" listProp="reports" renderItem={this.render_report.bind(this)} autofetch={true}/>

                <h2>Generate Export</h2>

                <Tabs>

                  <Tab label="Habits">

                    <br/>
                    <p className="lead">Export habit data</p>

                    { this.render_date_form() }

                    <RaisedButton label="Generate" primary={true} icon={<FontIcon className="material-icons">play_circle_filled</FontIcon>} onClick={this.generate_report.bind(this, 1)} />
                  </Tab>

                  <Tab label="Tasks">

                    <br/>
                    <p className="lead">Export task data</p>

                    { this.render_date_form() }

                    <RaisedButton label="Generate" primary={true} icon={<FontIcon className="material-icons">play_circle_filled</FontIcon>} onClick={this.generate_report.bind(this, 2)} />
                  </Tab>

                  <Tab label="Projects">

                    <br/>
                    <p className="lead">Export project data</p>

                    { this.render_date_form() }

                    <RaisedButton label="Generate" primary={true} icon={<FontIcon className="material-icons">play_circle_filled</FontIcon>} onClick={this.generate_report.bind(this, 6)} />
                  </Tab>

                  <Tab label="Goals">

                    <br/>
                    <p className="lead">Export goal data</p>

                    { this.render_date_form() }

                    <RaisedButton label="Generate" primary={true} icon={<FontIcon className="material-icons">play_circle_filled</FontIcon>} onClick={this.generate_report.bind(this, 3)} />
                  </Tab>

                  <Tab label="Journals">

                    <br/>
                    <p className="lead">Export journal data</p>

                    { this.render_date_form() }

                    <RaisedButton label="Generate" primary={true} icon={<FontIcon className="material-icons">play_circle_filled</FontIcon>} onClick={this.generate_report.bind(this, 4)} />
                  </Tab>

                  <Tab label="Events">

                    <br/>
                    <p className="lead">Export event data</p>

                    { this.render_date_form() }

                    <RaisedButton label="Generate" primary={true} icon={<FontIcon className="material-icons">play_circle_filled</FontIcon>} onClick={this.generate_report.bind(this, 5)} />
                  </Tab>

                  <Tab label="Tracking">

                    <br/>
                    <p className="lead">Export tracking data</p>

                    { this.render_date_form() }

                    <RaisedButton label="Generate" primary={true} icon={<FontIcon className="material-icons">play_circle_filled</FontIcon>} onClick={this.generate_report.bind(this, 7)} />
                  </Tab>

                </Tabs>
            </div>
        );
    }
};

module.exports = Reports;
