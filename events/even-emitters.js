import { 
    todoLoadEvent, 
    updateTodoEvent 
} from "./todo-events.js";


// emit event to load the view
const emitTodoLoadEvent = (data) => {
    if(data == undefined)
    {
        console.log(">>>> No data found to emit todoLoadEvent");
        return;
    }
    console.log(data);
    taskList = data.taskList;
    updateTime = data.updateTime;
    document.dispatchEvent(todoLoadEvent);
}

// emit event to update todo (used only in popup.js)
const emitUpdateTodoEvent = (shouldBackup) => {
    if(!shouldBackup) {
        chrome.runtime.connect({ name: "backup" });
        shouldBackup = true;
    }
    document.dispatchEvent(updateTodoEvent);
}


export {
    emitTodoLoadEvent,
    emitUpdateTodoEvent
}