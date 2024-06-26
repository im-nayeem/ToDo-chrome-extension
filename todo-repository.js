import {NotificationType} from "./constants.js";
import {notify, baseUrl, isInternetConnected} from "./utils.js";

  const syncTodo = (taskList, updateTime, emitEvent) => {
    isInternetConnected((isConnected) => {
        if(isConnected) {
            let apiUrl = baseUrl + 'api/get-todo.php';
            fetch(apiUrl)
            .then(response => response.json())
                .then(async (data) => {
                if(data.status === 401) 
                {
                    console.log("Unauthorized!");
                    chrome.tabs.create({ url: baseUrl + 'account/signin.php' });
                }
                else if(data.status === 200) 
                {
                    console.log("Fetched data from cloud: ");
                    console.log(data.result);

                    const resp = await fetch(baseUrl + 'api/get-user.php');
                    const jsonResponse = await resp.json();
                    const userInfo = await jsonResponse.result;
                    const currentUser = await getUserInfo();
                    if(Object.keys(currentUser).length === 0 && currentUser.constructor === Object || userInfo.email != currentUser.user.email)
                    {
                        console.log(`User didn't match! Clearing localstorage...\n Current user: ${currentUser.user.email} \n User logged in: ${userInfo.email}\n\n`);

                        await clearLocalStorage();
                        await storeUserInfo(userInfo);
                        taskList = [];
                        updateTime = null;
                    }

                    if(data.result !== null && data.result.updateTime > updateTime)
                    {
                        taskList = data.result.todo;
                        updateTime = data.result.updateTime;
                        emitEvent({taskList: taskList, updateTime: updateTime});
                        storeToDoInLocalStorage(taskList, updateTime);
                        console.log("Storing in localstorage. Syncing with cloud...");
                    }
                    else if(data.result == null || data.result.updateTime < updateTime)
                    {
                        storeTodoInCloud(taskList, updateTime);
                        console.log("Uploaded to cloud. Synced with localstorage...");
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

  const storeTodoInCloud = async (taskList, updateTime) => {
    isInternetConnected((isConnected) => {
       if(isConnected) {
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
    });
  }

  const getToDoFromLocalStorage = async () => {
    try {
      const response = await chrome.storage.local.get(['todo', 'updateTime']);
      const todos = response.todo;

      console.log("Data retrieved from localstorage...");
      console.log(todos);

      return {
        todo: todos ? todos : [],
        updateTime: response.updateTime ? response.updateTime : 0,
      };
    } catch (error) {
      console.error("Error getting data from local storage:", error);
      return {
        todo: [],
        updateTime: null,
      };
    }
  }

  const storeToDoInLocalStorage = async (taskList, updateTime) => {
    await chrome.storage.local.set({todo: taskList});
    await chrome.storage.local.set({updateTime: updateTime});
    console.log("Stored in localstorage...");
  }

  const storeUserInfo = async(user) => {
    await chrome.storage.local.set({user: user});
  }

  const getUserInfo = async() => {
    return await chrome.storage.local.get(['user']);
  }

  const clearLocalStorage = async () => {
    await chrome.storage.local.set({todo: []});
    await chrome.storage.local.set({updateTime: null});
    await chrome.storage.local.set({userInfo: null});
  }

  export { storeToDoInLocalStorage, getToDoFromLocalStorage, storeTodoInCloud, syncTodo };