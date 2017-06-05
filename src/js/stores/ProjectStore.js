var alt = require('config/alt');
import ProjectActions from 'actions/ProjectActions';
import ProjectSource from 'sources/ProjectSource';
import {findIndexById} from 'utils/store-utils';

class ProjectStore {
    constructor() {
        this.bindActions(ProjectActions);
        this.projects = []
        this.loaded = false
        this.working = false
        this.registerAsync(ProjectSource)

        this.exportPublicMethods({
            getProjectByTitle: this.getProjectByTitle,
            getProjectById: this.getProjectById,
        })
    }

    onFetchingProjects() {
        this.working = true
    }

    onFetchingProjectsFailed() {
        this.working = false
    }

    onGotProjects({projects}) {
        this.projects = projects
        this.working = false
        this.loaded = true
    }

    onUpdatingProject() {
        this.working = true
    }

    onUpdatingProjectFailed() {
        this.working = false
    }

    onUpdatedProject(project) {
        let idx = findIndexById(this.projects, project.id, 'id');
        if (idx > -1) this.projects[idx] = project;
        else this.projects.push(project);
        this.working = false
    }

    // Public

    getProjectByTitle(title) {
        let projects = this.getState().projects
        let idx = findIndexById(projects, title, 'title');
        if (idx > -1) return projects[idx]
    }

    getProjectById(id) {
        let projects = this.getState().projects
        let idx = findIndexById(projects, id, 'id');
        if (idx > -1) return projects[idx]
    }

}

module.exports = (alt.createStore(ProjectStore, "ProjectStore"));