  import { getToDoFromLocalStorage, storeToDoInLocalStorage, syncTodo, storeTodoInCloud } from "./todo-repository.js";



  // chrome.runtime.onInstalled.addListener(({ reason }) => {
  //   if (reason === 'install') {
  //     chrome.storage.local.set({
  //       baseUrl: "http://localhost:8089/"
  //     });
  //   }
  // });


 chrome.runtime.onMessage.addListener((message, sender, emitEvent) => {
    if (message.action === 'syncTodo') {
      getToDoFromLocalStorage().then( (data) => {
         syncTodo(data.taskList, data.updateTime, emitEvent);
      });
      return true;
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, emitEvent) => {
    if (message.action === 'updateTodo') {
      storeToDoInLocalStorage(message.taskList, message.updateTime).then( () => {
        emitEvent({taskList: message.taskList, updateTime: message.updateTime});
        storeTodoInCloud(message.taskList, message.updateTime);
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
