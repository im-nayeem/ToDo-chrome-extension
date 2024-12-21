import { isInternetConnected } from "../utils.js";

const syncTodo = async (taskList, updateTime, emitEvent) => {
    isInternetConnected(async (isConnected) => {
      if (isConnected) {
        let apiUrl = baseUrl + 'api/get-todo.php';
        try {
          const response = await fetch(apiUrl);
          const data = await response.json();
  
          if (data.status === 401) {
            console.log("Unauthorized!");
            chrome.tabs.create({ url: baseUrl + 'account/signin.php' });
          } else if (data.status === 200) {
            console.log("Fetched data from cloud: ");
            console.log(data.result);
  
            const userResponse = await fetch(baseUrl + 'api/get-user.php');
            const jsonResponse = await userResponse.json();
            const userInfo = jsonResponse.result;
            const currentUser = await getUserInfoFromIndexedDB();
  
            if (Object.keys(currentUser).length === 0 || userInfo.email !== currentUser.user.email) {
              console.log(`User didn't match! Clearing IndexedDB...\n Current user: ${currentUser.user.email} \n User logged in: ${userInfo.email}\n\n`);
              await clearIndexedDB();
              await storeUserInfoInIndexedDB(userInfo);
              taskList = [];
              updateTime = null;
            }
  
            if (data.result !== null && data.result.updateTime > updateTime) {
              taskList = data.result.todo;
              updateTime = data.result.updateTime;
              emitEvent({ taskList, updateTime });
              await storeToDoInLocalStorage(taskList, updateTime);
              console.log("Storing in IndexedDB. Syncing with cloud...");
            } else if (data.result == null || data.result.updateTime < updateTime) {
              storeTodoInCloud(taskList, updateTime);
              console.log("Uploaded to cloud. Synced with IndexedDB...");
            }
          } else {
            notify(NotificationType.ERROR, "Error while fetching data from server!");
            throw new Error(`API error! Status: ${data.status}`);
          }
        } catch (error) {
          notify(NotificationType.ERROR, "Error while connecting with server!");
          console.error('Fetch error:', error);
        }
      }
    });
  };