import { NotificationType } from "./constants.js";
import { notify, baseUrl, isInternetConnected } from "./utils.js";

// Step 1: Open IndexedDB
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TodoDB', 1);

    request.onerror = (event) => {
      console.error("Database error:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      console.log("Database opened successfully.");
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('todos')) {
        db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('user')) {
        db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
      }
      console.log("Database setup complete.");
    };
  });
};

// Step 2: Store data in IndexedDB
const storeDataInDB = (storeName, data) => {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => {
      console.log(`${storeName} stored successfully.`);
      resolve();
    };

    request.onerror = (event) => {
      console.error(`Error storing ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
  });
};

// Step 3: Retrieve data from IndexedDB
const getDataFromDB = (storeName, key) => {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = (event) => {
      console.log(`${storeName} retrieved successfully.`);
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error(`Error retrieving ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
  });
};

// Step 4: Clear IndexedDB
const clearDataInDB = (storeName) => {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => {
      console.log(`${storeName} cleared successfully.`);
      resolve();
    };

    request.onerror = (event) => {
      console.error(`Error clearing ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
  });
};

// Store To-do in IndexedDB (retaining the original function name)
const storeToDoInLocalStorage = async (taskList, updateTime) => {
  await storeDataInDB('todos', { id: 1, todo: taskList, updateTime: updateTime });
};

// Get To-do from IndexedDB (retaining the original function name)
const getToDoFromLocalStorage = async () => {
  try {
    const result = await getDataFromDB('todos', 1);
    return {
      todo: result?.todo || [],
      updateTime: result?.updateTime || 0,
    };
  } catch (error) {
    console.error("Error getting data from IndexedDB:", error);
    return {
      todo: [],
      updateTime: null,
    };
  }
};

// Store User Info in IndexedDB
const storeUserInfoInIndexedDB = async (user) => {
  await storeDataInDB('user', { id: 1, user });
};

// Get User Info from IndexedDB
const getUserInfoFromIndexedDB = async () => {
  return await getDataFromDB('user', 1);
};

// Clear data in IndexedDB
const clearIndexedDB = async () => {
  await clearDataInDB('todos');
  await clearDataInDB('user');
};

// Sync To-do with cloud and local IndexedDB (retaining the original function name)
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

// Store To-do in the cloud (no changes needed)
const storeTodoInCloud = async (taskList, updateTime) => {
  isInternetConnected((isConnected) => {
    if (isConnected) {
      fetch(baseUrl + "api/update-todo.php", {
        method: "POST",
        body: JSON.stringify({ "updateTime": updateTime, "todo": taskList }),
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
};

export {
  storeToDoInLocalStorage,
  getToDoFromLocalStorage,
  storeTodoInCloud,
  syncTodo
};
