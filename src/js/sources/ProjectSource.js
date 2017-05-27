
var ProjectActions = require('actions/ProjectActions');
var api = require('utils/api');
import {findIndexById} from 'utils/store-utils';

const _PROJECT_API_URL = '/api/project';
const _construct_api_url = (url_part) => `${_PROJECT_API_URL}/${url_part}`;

const ProjectSource = {

    fetchProjects: {

        remote(state) {
            return api.get("/api/project/active", {})
        },

        // this function checks in our local cache first
        // if the value is present it'll use that instead (optional).
        local(state) {
            if (state.loaded) {
                return state.projects
            }
        },

        // here we setup some actions to handle our response
        loading: ProjectActions.fetchingProjects, // (optional)
        success: ProjectActions.gotProjects, // (required)
        error: ProjectActions.fetchingProjectsFailed, // (required)

        // shouldFetch(state) {
        //   return true
        // }
    },

    updateProject: {
        remote(state, params) {
            return api.post("/api/project", params)
        },

        loading: ProjectActions.updatingProject,
        success: ProjectActions.updatedProject,
        error: ProjectActions.updatingProjectFailed
    }

};

export default ProjectSource;
