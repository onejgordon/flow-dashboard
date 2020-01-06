var React = require('react');
var util = require('utils/util');
import {changeHandler} from 'utils/component-utils';
var api = require('utils/api');
var FetchedList = require('components/common/FetchedList');
import {ListItem, IconButton, IconMenu, MenuItem, FontIcon} from 'material-ui'

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

    confirm_delete(h) {
        var r = confirm('This will delete this habit, and all tracked history. This cannot be undone. Are you sure?');
        if (r) this.delete(h)
    }

    delete(h) {
        api.post("/api/habit/delete", {id: h.id}, (res) => {
            if (res.success) this.refs.habits.remove_item_by_key(h.id, 'id')
        })
    }

    render_habit(h) {
        let archive_icon = !h.archived ? 'archive' : 'unarchive'
        let menu = [
            {icon: archive_icon, click: this.toggle_archived.bind(this, h), label: util.capitalize(archive_icon)}
        ]
        if (h.archived) {
            // Add delete option
            menu.push({icon: 'delete', click: this.confirm_delete.bind(this, h), label: "Delete habit"})
        }
        let rightIcon = (
            <IconMenu iconButtonElement={<IconButton iconClassName="material-icons">more_vert</IconButton>}>
              { menu.map((mi, i) => {
                return <MenuItem key={i} leftIcon={<FontIcon className="material-icons">{mi.icon}</FontIcon>} onTouchTap={mi.click}>{mi.label}</MenuItem>
              }) }
            </IconMenu>
        )
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
