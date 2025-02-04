import { 
    getToDoFromLocalStorage, 
    storeToDoInLocalStorage, 
    syncTodo, storeTodoInCloud 
  } from "./repository/repository.js";

 chrome.runtime.onMessage.addListener((message, sender, callBack) => {
    if (message.action === 'syncTodo') {
      getToDoFromLocalStorage().then( (data) => {
         syncTodo(data.todo, data.metaData, callBack);
      });
      return true;
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, callBack) => {
    if (message.action === 'updateTodo') {
      storeToDoInLocalStorage(message.taskList, message.metaData).then( () => {
        callBack({taskList: message.taskList, metaData: message.metaData});
      });
      return true;
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, callBack) => {
    if (message.action === 'loadData') {
     getToDoFromLocalStorage().then((data) => {
        callBack({taskList: data.todo, metaData: data.metaData});
      });
      return true;
    }
  });


  chrome.runtime.onMessage.addListener((message, sender, callBack) => {
    if (message.action === 'loadByLabel') {
     getToDoFromLocalStorage().then((data) => {
        const todos = data.todo;
        let filteredTodos = []; 
        todos.forEach(task => {
            if(task.labels !== undefined)
            {
                let shouldInclude = false;
                task.labels.split(',').map(label => label.trim()).forEach(label => {
                    if(label == message.label) {
                      shouldInclude = true;
                    }
                });
                if(shouldInclude) {
                  filteredTodos.push(task);
                }
            }
        });
        callBack({taskList: filteredTodos, metaData: data.metaData});
      });
      return true;
    }
  });
  chrome.runtime.onConnect.addListener(function(port) {
    if (port.name === "backup") {
      port.onDisconnect.addListener( () => {
        console.log("Popup closed. Starting back-up...");
        getToDoFromLocalStorage().then( (data) => {
          storeTodoInCloud(data.todo, data.metaData);
       });
      });
    }
  });

  chrome.runtime.onConnectExternal.addListener(function (port) {
    console.log(`Connected by external source: ${port.name}`);

    if (port.name === 'backup') {
        // Listen for disconnection
        port.onDisconnect.addListener(() => {
            console.log('Disconnected from external source.');
            // You can trigger the backup logic here
        });

        // Optional: Handle messages from the external source (website)
        port.onMessage.addListener(function (message) {
            console.log('Message from external source:', message);
            // Optionally respond
            // port.postMessage({ response: 'Message received' });
        });
    }
});

  