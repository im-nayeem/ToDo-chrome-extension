  import {NotificationType, OperationType} from "./model.js";
  import {notify, baseUrl} from "./utils.js";


  chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
      chrome.storage.local.set({
        baseUrl: "http://localhost:8089/"
      });
    }
  });


 chrome.runtime.onMessage.addListener((message, sender, loadView) => {
    if (message.action === 'saveTasks') {
        fetchAndLoadView(message.taskList, message.updateTime, loadView)
        return true;
    }
  });

  const fetchAndLoadView = (taskList, updateTime, loadView) => {
    isInternetConnected((isConnected) => {
        if(isConnected) {
            let apiUrl = baseUrl + 'api/get-todo.php';
            fetch(apiUrl)
            .then(response => response.json())
                .then(data => {
                if(data.status === 401) 
                {
                  chrome.tabs.create({ url: baseUrl + 'account/signin.php' });
                }
                else if(data.status === 200) 
                {
                    if(data.result !== null && data.result.updateTime > updateTime)
                    {
                        taskList = data.result.todo;
                        updateTime = data.result.updateTime;
                        storeToDoLocally(taskList, updateTime);
                        loadView();
                    }
                    else if(data.result == null || data.result.updateTime < updateTime)
                    {
                        fetch(baseUrl + "api/update-todo.php", {
                            method: "POST",
                            body: JSON.stringify({"updateTime":updateTime, "todo":taskList}),
                            headers: {
                                "Content-type": "application/json"
                            }
                        })
                        .then((response) => response.json())
                            .then((json) => {
                                notify(NotificationType.SUCCESS, "Back-up completed");
                            })
                              .catch(error => {
                                  notify(NotificationType.ERROR, error);
                        });
                    }
                }
                else {
                    notify(NotificationType.ERROR, "Error while fetching data from server!");
                    throw new Error(`API error! Status: ${data.status}`);
                }
            })
            .catch(error => {
                notify(NotificationType.ERROR, "Error while connecting with server!");
                console.error('Fetch error:', error);
            });
        }else{
            return;
        }
    });
  }

 const isInternetConnected = (callback) => {
      fetch('https://www.google.com', { method: 'HEAD', mode: 'no-cors'})
          .then(response => {
              callback(true);
              console.log("Connected to internet...");
          })
          .catch(error => {
              callback(false);
              console.log(error);
          });
  }


  const storeToDoLocally = (taskList, updateTime) => {
    chrome.storage.local.set({
      todo: taskList,
      updateTime: updateTime
    }, () => {
      console.log("Data saved to local storage");
    });
  }