import { AppStore } from "../store/app-store.js";
import { todoLoadEvent, updateTodoEvent } from "./todo-events.js";


const emitTodoLoadEvent = (data) => {
    if(data == undefined)
    {
        console.log(">>>> No data found to emit todoLoadEvent");
        return;
    }
    console.log(data);
    const appStore = AppStore.getInstance();
    console.log(">>>> Emitting todoLoadEvent");
    console.log(appStore);
    appStore.taskList =  [...data.taskList];
    appStore.updateTime = Date.now();
    document.dispatchEvent(todoLoadEvent)
}

const emitUpdateTodoEvent = () => {
    const appStore = AppStore.getInstance();
    if(!appStore.shouldBackup) {
        chrome.runtime.connect({ name: "backup" });
        shouldBackup = true;
    }
    document.dispatchEvent(updateTodoEvent);
}


export { emitTodoLoadEvent, emitUpdateTodoEvent };