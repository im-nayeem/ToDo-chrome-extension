import { 
  DATABASE_NAME, 
  DATABASE_VERSION, 
  ObjectStoreName,
  OperationMode
} from "../constants/db-constants.js";

const openDB = async () => {
    return new Promise( (resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
  
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
        if (!db.objectStoreNames.contains(ObjectStoreName.TODO)) {
          const toDoObjectStore = db.createObjectStore(ObjectStoreName.TODO, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(ObjectStoreName.USER)) {
          const userObjectStore = db.createObjectStore(ObjectStoreName.USER, { keyPath: 'id', autoIncrement: true });
        }
        console.log("Database setup complete.");
      };
    })
}

const getTransaction = async (objectStoreName) => {
  const db = await openDB();
  const transaction =  db.transaction([objectStoreName], OperationMode.READWRITE);
  transaction.oncomplete = (event) => {
      console.log('Transaction completed.');
      return transaction;
  };
  
  transaction.onerror = (event) => {
   console.log('Transaction not opened due to error.');
   return null;
  };
};

const getObjectStore = async (objectStoreName) => {
  const transaction = await getTransaction(objectStoreName);
  const objectStore = transaction.objectStore(objectStoreName);
  return objectStore;
}