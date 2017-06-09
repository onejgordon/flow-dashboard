
import alt from 'config/alt.js';


class TaskActions {
    constructor() {
        this.generateActions('openTaskDialog', 'closeTaskDialog');
    }

}

export default alt.createActions(TaskActions);
