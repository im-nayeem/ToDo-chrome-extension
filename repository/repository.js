import { NotificationType } from "../constants.js";
import { ObjectStoreName, OperationMode } from "../constants/db-constants.js";
import { METADATA_ID, TodoConstants } from "../constants/todo-constants.js";
import { getObjectStore, getTransaction } from "../database-context/db-context.js";
import { notify, baseUrl, isInternetConnected } from "../utils.js";


const storeToDo = async (todos) => {
    const transaction = await getTransaction(OperationMode.READWRITE, ObjectStoreName.TODO);
    const store = await getObjectStore(OperationMode.READWRITE, ObjectStoreName.TODO);
    await Promise.all(todos.map(todo => store.put(todo)));
    await transaction.Complete;
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve("Todos saved successfully!");
        transaction.onerror = () => reject("Failed to save todos!");
    });
}

const storeMetaData = (metaData) => {
  return new Promise(async (resolve, reject) => {
    const store = await getObjectStore(OperationMode.READWRITE, ObjectStoreName.METADATA);
    const request = store.put(metaData);
    request.onsuccess = () => {
      console.log(`${ObjectStoreName.METADATA} stored successfully.`);
      resolve();
    };
    request.onerror = (event) => {
      console.error(`Error storing ${ObjectStoreName.METADATA}:`, event.target.error);
      reject(event.target.error);
    };
  });
}

const getMetaData = () => {
  return new Promise(async (resolve, reject) => {
    const objectStore = await getObjectStore(OperationMode.READ, ObjectStoreName.METADATA);
    const request = objectStore.get(METADATA_ID);
    request.onsuccess = (event) => {
      console.log(`MetaData retrieved from ${ObjectStoreName.METADATA} successfully.`);
      resolve(event.target.result);
    };  
    request.onerror = (event) => {
      console.error(`Error retrieving from ${ObjectStoreName.METADATA}:`, event.target.error);
      reject(event.target.error);
    };
  });
}

const getAllToDo = () => {
  const todos = [];
  return new Promise(async (resolve, reject) => {
    const objectStore = await getObjectStore(OperationMode.READ, ObjectStoreName.TODO);
    const request = objectStore.openCursor();
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        todos.push(cursor.value); 
        cursor.continue();
      } else {
        console.log(`ToDo list retrieved from indexedDB successfully.`);
        resolve(todos);
      }
    };
    request.onerror = (event) => {
        console.error(`Error retrieving ${storeName}:`, event.target.error);
        reject(event.target.error);
    };
  });
}

// Retrieve data from IndexedDB
const getTodoById = (id) => {
  return new Promise(async (resolve, reject) => {
    const objectStore = await getObjectStore(OperationMode.READ, ObjectStoreName.TODO);
    const index = objectStore.index(`${TodoConstants.ID}Index`);
    const request = index.get(id);

    request.onsuccess = (event) => {
        console.log(`${TodoConstants.ID} = ${fieldValue} retrieved from ${storeName} successfully.`);
        resolve(event.target.result);
    };
    request.onerror = (event) => {
        console.error(`Error retrieving ${storeName}:`, event.target.error);
        reject(event.target.error);
    };
  });
};

const getTodoByFieldKey = (fieldKey, fieldValue) => {
    return new Promise(async (resolve, reject) => {
        const objectStore = await getObjectStore(OperationMode.READ, ObjectStoreName.TODO);
        const index = objectStore.index(`${fieldName}Index`);
        const request = index.getAll(fieldValue);
    
        request.onsuccess = (event) => {
          console.log(`${fieldKey} = ${fieldValue} retrieved from ${ObjectStoreName.TODO} successfully.`);
          resolve(event.target.result);
        };  
        request.onerror = (event) => {
          console.error(`Error retrieving from ${ObjectStoreName.TODO}:`, event.target.error);
          reject(event.target.error);
        };
      });
}

const clearDataInDB = (storeName) => {
  return new Promise(async (resolve, reject) => {
    const store = await getObjectStore(OperationMode.READWRITE, storeName);
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
const storeDataInLocalStorage = async (todos, metaData) => {
  await storeToDo(todos);
  await storeMetaData(metaData);
};

// Get To-do from IndexedDB (retaining the original function name)
const getToDoFromLocalStorage = async () => {
  try {
    const todos = await getAllToDo();
    const metaData = await getMetaData();
    return {
      todo: todos ? todos : [],
      metaData: metaData ? metaData : null,
    };
  } catch (error) {
    console.error("Error getting data from IndexedDB:", error);
    return {
      todo: [],
      metaData: null,
    };
  }
};

// Store User Info in IndexedDB
const storeUserInfoInIndexedDB = async (user) => {
  await storeDataInIndDB('user', { id: 1, user });
};

// Get User Info from IndexedDB
const getUserInfoFromIndexedDB = async () => {
  return await getTodoById('user', 1);
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
            await storeDataInLocalStorage(taskList, updateTime);
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
  storeDataInLocalStorage as storeToDoInLocalStorage,
  getToDoFromLocalStorage,
  storeTodoInCloud,
  syncTodo
};
