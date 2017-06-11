var React = require('react');

import {Bar, Line} from "react-chartjs-2";
import connectToStores from 'alt-utils/lib/connectToStores';
import {IconMenu, MenuItem, FontIcon, IconButton} from 'material-ui'
var api = require('utils/api');
import {Link} from 'react-router'
import {get} from 'lodash';
import {findItemById} from 'utils/store-utils';

@connectToStores
export default class AnalysisMisc extends React.Component {
    static defaultProps = {
        tracking_days: []
    };
    constructor(props) {
        super(props);
        this.state = {
            readables_read: []
        };
    }

    static getStores() {
        return [];
    }

    static getPropsFromStores() {
        return {};
    }

    componentDidMount() {
        let since = this.props.iso_dates[0];
        api.get("/api/readable", {read: 1, since: since}, (res) => {
            console.log(res.readables);
            this.setState({readables_read: res.readables});
        })
    }

    productivity_data() {
        let {tracking_days, iso_dates, user} = this.props;
        let {readables_read} = this.state;
        let labels = [];
        let commit_data = [];
        let reading_data = [];
        let date_to_read_count = {};
        let vars = [];
        if (user.settings) vars = get(user.settings, ['tracking', 'chart_vars'], []);
        let var_data = {}; // var.name -> data array
        readables_read.forEach((r) => {
            if (!date_to_read_count[r.date_read]) date_to_read_count[r.date_read] = 0;
            date_to_read_count[r.date_read] += 1;
        });
        iso_dates.forEach((date) => {
            let td = findItemById(tracking_days, date, 'iso_date');
            commit_data.push(td ? td.data.commits : 0);
            reading_data.push(date_to_read_count[date] || 0);
            vars.forEach((v) => {
                if (!var_data[v.name]) var_data[v.name] = [];
                let val = 0;
                if (td) val = td.data[v.name] || 0;
                if (v.mult) val *= v.mult;
                var_data[v.name].push(val);
            });
            labels.push(date);
        });
        // Align reading counts with tracking days
        let datasets = [
            {
                label: "Commits",
                data: commit_data,
                backgroundColor: '#44ff44'
            },
            {
                label: "Items Read",
                data: reading_data,
                backgroundColor: '#E846F9'
            }
        ];
        vars.forEach((v) => {
            if (var_data[v.name]) {
                datasets.push({
                    label: v.label,
                    data: var_data[v.name],
                    backgroundColor: v.color || '#FFFFFF'
                })
            }
        })
        console.log(datasets);
        let pdata = {
            labels: labels,
            datasets: datasets
        };
        return pdata;
    }

    render() {
        let {loaded, tracking_days} = this.props;
        let today = new Date();
        let trackingData = this.productivity_data();
        let trackingOps = {
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                }],
                yAxes: [{
                    ticks: {
                        min: 0
                    }
                }],
            }
        };
        if (!loaded) return null;

        return (
            <div>

                  <IconMenu className="pull-right" iconButtonElement={<IconButton iconClassName="material-icons">more_vert</IconButton>}>
                    <Link to="/app/tracking/history"><MenuItem key="list" primaryText="View Raw Tracking Data" leftIcon={<FontIcon className="material-icons">list</FontIcon>} /></Link>
                  </IconMenu>

                <h4>Tracking</h4>

                <Bar data={trackingData} options={trackingOps} width={1000} height={450}/>

            </div>
        );
    }
}

module.exports = AnalysisMisc;