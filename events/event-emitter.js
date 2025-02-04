import { uuidv4 } from "../helpers/guid-helper.js";
import { AppStore } from "../store/app-store.js";
import { todoLoadEvent, updateTodoEvent } from "./todo-events.js";

const emitTodoLoadEvent = (data) => {
    const appStore = AppStore.getInstance();
    if(data != undefined)
    {
        Object.assign(appStore.taskList, data.taskList);
    }
    console.log(data);
    console.log(">>>> Emitting todoLoadEvent");
    console.log(appStore);
    document.dispatchEvent(todoLoadEvent)
}

const emitUpdateTodoEvent = () => {
    const appStore = AppStore.getInstance();
    if(!appStore.shouldBackup) {
        chrome.runtime.connect({ name: "backup" });
        appStore.shouldBackup = true;
    }
    appStore.metaData.changeSignature = uuidv4();
    appStore.metaData.timeStamp = Date.now();
    document.dispatchEvent(updateTodoEvent);
}


export { emitTodoLoadEvent, emitUpdateTodoEvent };