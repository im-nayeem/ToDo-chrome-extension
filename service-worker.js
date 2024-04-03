  import { getToDoFromLocalStorage, storeToDoInLocalStorage, syncTodo, storeTodoInCloud } from "./todo-repository.js";

 chrome.runtime.onMessage.addListener((message, sender, emitEvent) => {
    if (message.action === 'syncTodo') {
      getToDoFromLocalStorage().then( (data) => {
         syncTodo(data.todo, data.updateTime, emitEvent);
      });
      return true;
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, emitEvent) => {
    if (message.action === 'updateTodo') {
      storeToDoInLocalStorage(message.taskList, message.updateTime).then( () => {
        emitEvent({taskList: message.taskList, updateTime: message.updateTime});
      });
      return true;
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, emitEvent) => {
    if (message.action === 'loadData') {
     getToDoFromLocalStorage().then((data) => {
        emitEvent({taskList: data.todo, updateTime: data.updateTime});
      });
      return true;
    }
  });

chrome.runtime.onConnect.addListener(function(port) {
  if (port.name === "backup") {
      port.onDisconnect.addListener( () => {
        console.log("Popup closed. Starting back-up...");
        getToDoFromLocalStorage().then( (data) => {
          storeTodoInCloud(data.todo, data.updateTime);
       });
      });
  }
});