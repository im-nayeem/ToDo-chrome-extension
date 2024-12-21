import { 
  DATABASE_NAME, 
  DATABASE_VERSION, 
  ObjectStoreName,
} from "../constants/db-constants.js";
import { TodoConstants } from "../constants/todo-constants.js";

const dbContext = {};

const openDB = async () => {
    if(dbContext.Instance) {
      return dbContext.Instance;
    }
    return new Promise( (resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
  
      request.onerror = (event) => {
        console.error("Database error:", event.target.error);
        reject(event.target.error);
      };
  
      request.onsuccess = (event) => {
        console.log("Database opened successfully.");
        dbContext['Instance'] = event.target.result;
        resolve(event.target.result);
      };
  
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(ObjectStoreName.TODO)) {
          const toDoObjectStore = db.createObjectStore(ObjectStoreName.TODO, { keyPath: 'id', autoIncrement: true });
          toDoObjectStore.createIndex(`${TodoConstants.INDEX}Index`, TodoConstants.INDEX, { unique: true });
          toDoObjectStore.createIndex(`${TodoConstants.ID}Index`, TodoConstants.ID, { unique: true });

        }
        if (!db.objectStoreNames.contains(ObjectStoreName.USER)) {
          db.createObjectStore(ObjectStoreName.USER, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(ObjectStoreName.METADATA)) {
          db.createObjectStore(ObjectStoreName.METADATA, { keyPath: 'id', autoIncrement: true });
        }
        console.log("Database setup complete.");
      };
    });
}

const getTransaction = async (operationMode, objectStoreName) => {
  const db = await openDB();
  return db.transaction([objectStoreName], operationMode);
}

const getObjectStore = async (operationMode, objectStoreName) => {
  try {
    const transaction = await getTransaction(operationMode, objectStoreName);
    return transaction.objectStore(objectStoreName);
  } catch (error) {
    console.error('Error getting object store:', error);
    return null;
  }
}

export {
  getObjectStore,
  getTransaction
};