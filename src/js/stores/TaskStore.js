var alt = require('config/alt');
import TaskActions from 'actions/TaskActions';


class TaskStore {
    constructor() {
        this.bindActions(TaskActions);
        this.dialog_open = false
    }

    onOpenTaskDialog() {
        this.dialog_open = true
    }

    onCloseTaskDialog() {
        this.dialog_open = false
    }

}

module.exports = (alt.createStore(TaskStore, "TaskStore"));