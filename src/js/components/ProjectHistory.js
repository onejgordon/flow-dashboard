var React = require('react');
var util = require('utils/util');
import {changeHandler} from 'utils/component-utils';
var api = require('utils/api');
var FetchedList = require('components/common/FetchedList');
import {ListItem, IconButton} from 'material-ui'

@changeHandler
export default class ProjectHistory extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        util.set_title("Project History");
    }

    componentDidUpdate(prevProps, prevState) {
    }

    toggle_archived(prj) {
        api.post("/api/project", {id: prj.id, archived: prj.archived ? 0 : 1}, (res) => {
            this.refs.projects.update_item_by_key(res.project, 'id')
        })
    }

    render_project(prj) {
        let icon = !prj.archived ? 'archive' : 'unarchive'
        let rightIcon = <IconButton iconClassName="material-icons"
                            onClick={this.toggle_archived.bind(this, prj)}
                            tooltip={util.capitalize(icon)}>{ icon }</IconButton>
        let secondary = ["Created " + util.printDate(prj.ts_created)]
        if (prj.archived) secondary.push("Archived")
        let st = {}
        let title = <span style={st}>{ prj.title }</span>
        return <ListItem
                    primaryText={title}
                    secondaryText={secondary.join(' | ')}
                    rightIconButton={rightIcon} />
    }

    render() {
        let params = {}
        return (
            <div>

                <h1>Project History</h1>

                <FetchedList ref="projects"
                            url="/api/project"
                            params={params}
                            listProp="projects"
                            listStyle="mui"
                            per_page={30}
                            renderItem={this.render_project.bind(this)}
                            autofetch={true}
                            paging_enabled={true} />

            </div>
        );
    }
}

module.exports = ProjectHistory;
