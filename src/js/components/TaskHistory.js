var React = require('react');
var TaskLI = require('components/list_items/TaskLI');
var util = require('utils/util');
import {changeHandler} from 'utils/component-utils';
import {clone} from 'lodash';
var FetchedList = require('components/common/FetchedList');

@changeHandler
export default class TaskHistory extends React.Component {
    static defaultProps = {};
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        util.set_title("Task History");
    }

    render_task(t) {
        return <TaskLI task={t} wip_enabled={false}
                       checkbox_enabled={false}
                       edit_enabled={false}
                       absolute_date={true}
                       archive_enabled={false} />
    }

    render() {
        let params = {with_archived: 1}
        return (
            <div>

                <h1>Task History</h1>

                <FetchedList ref="tasks"
                            url="/api/task"
                            params={params}
                            listProp="tasks"
                            per_page={20}
                            renderItem={this.render_task.bind(this)}
                            autofetch={true}
                            paging_enabled={true} />

            </div>
        );
    }
}

module.exports = TaskHistory;
