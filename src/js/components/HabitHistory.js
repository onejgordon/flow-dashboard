var React = require('react');
var util = require('utils/util');
import {changeHandler} from 'utils/component-utils';
var api = require('utils/api');
var FetchedList = require('components/common/FetchedList');
import {ListItem, IconButton} from 'material-ui'

@changeHandler
export default class HabitHistory extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        util.set_title("Habit History");
    }

    componentDidUpdate(prevProps, prevState) {
    }

    toggle_archived(h) {
        api.post("/api/habit", {id: h.id, archived: h.archived ? 0 : 1}, (res) => {
            this.refs.habits.update_item_by_key(res.habit, 'id')
        })
    }

    render_habit(h) {
        let icon = !h.archived ? 'archive' : 'unarchive'
        let rightIcon = <IconButton iconClassName="material-icons"
                            onClick={this.toggle_archived.bind(this, h)}
                            tooltip={util.capitalize(icon)}>{ icon }</IconButton>
        let secondary = ["Created " + util.printDate(h.ts_created)]
        if (h.archived) secondary.push("Archived")
        let st = {}
        if (h.archived) st.color = "#555";
        let title = <span style={st}>{ h.name }</span>
        return <ListItem
                    primaryText={title}
                    secondaryText={secondary.join(' | ')}
                    rightIconButton={rightIcon} />
    }

    render() {
        let params = {}
        return (
            <div>

                <h1>Habit History</h1>

                <FetchedList ref="habits"
                            url="/api/habit"
                            params={params}
                            listProp="habits"
                            listStyle="mui"
                            per_page={30}
                            renderItem={this.render_habit.bind(this)}
                            autofetch={true}
                            paging_enabled={true} />

            </div>
        );
    }
}

module.exports = HabitHistory;
