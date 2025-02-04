import { MetaData } from "../models/models.js";

class Store {
    static #instance; 

    constructor(shouldBackup = false, taskList = [], user = null, metaData = null, actionHandlers = {}) {
        if (Store.#instance) {
            return Store.#instance;
        }
        this.shouldBackup = shouldBackup; 
        this.taskList = taskList;
        this.user = user;
        this.metaData = metaData;
        if(this.metaData == null) {
            this.metaData = new MetaData(null, Date.now());
        };
        this.actionHandlers = actionHandlers;
        Store.#instance = this; 
    }

    static getInstance(shouldBackup = false, taskList = [], user = null, metaData = null, actionHandlers = {}) {
        if (!Store.#instance) {
            Store.#instance = new Store(shouldBackup, taskList, user, metaData, actionHandlers);
        }
        console.log(">>>> AppState instance created");
        console.log(Store.#instance);
        return Store.#instance;
    }
}
const store = Store.getInstance();
class AppStore {
    static getInstance() {
        return store;
    }
} 

export { AppStore };
