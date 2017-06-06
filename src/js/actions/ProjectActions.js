
import alt from 'config/alt.js';


class ProjectActions {
    constructor() {
        this.generateActions('fetchingProjects', 'fetchingProjectsFailed', 'updatingProject', 'updatingProjectFailed');
    }

    gotProjects(result) {
        return {
            projects: result.projects
        }
    }

    updatedProject(result) {
        return result.project
    }
}

export default alt.createActions(ProjectActions);
