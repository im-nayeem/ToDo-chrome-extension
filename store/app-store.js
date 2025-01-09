export class AppStore {
    static #instance; 

    constructor(shouldBackup = false, taskList = [], user = null, metaData = null, actionHandlers = {}) {
        if (AppState.#instance) {
            return AppState.#instance;
        }

        this.shouldBackup = shouldBackup; 
        this.taskList = taskList;
        this.user = user;
        this.metaData = metaData;
        this.actionHandlers = actionHandlers;
        AppState.#instance = this; 
    }

    static getInstance(shouldBackup = false, taskList = [], user = null, metaData = null, actionHandlers = {}) {
        if (!AppState.#instance) {
            AppState.#instance = new AppState(shouldBackup, taskList, user, metaData, actionHandlers);
        }
        return AppState.#instance;
    }
}
