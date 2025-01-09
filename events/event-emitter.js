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
const emitUpdateTodoEvent = () => {
    if(!AppState. shouldBackup) {
        chrome.runtime.connect({ name: "backup" });
        shouldBackup = true;
    }
    document.dispatchEvent(updateTodoEvent);
}