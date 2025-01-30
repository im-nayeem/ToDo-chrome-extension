import { AppStore } from "../store/app-store.js";
import { EventConstants } from "../constants/event-constants.js";
import { emitTodoLoadEvent } from "./event-emitter.js";

export class EventHandler {
    static registerEventListeners() {
        const appStore = AppStore.getInstance();
        document.addEventListener(EventConstants.LOAD_TODO, (event) => {
            appStore.actionHandlers['LoadView']();
        });
        
        document.addEventListener(EventConstants.UPDATE_TODO, (event) => {
            const appStore = AppStore.getInstance();
            chrome.runtime.sendMessage({ 
                action: 'updateTodo', 
                taskList: appStore.taskList, updateTime: Date.now() 
            }, emitTodoLoadEvent); 
        });
    }
}

export class EventListener {
    static 
}