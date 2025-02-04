const DATABASE_VERSION = 2;
const DATABASE_NAME = 'TodoDB';

const ObjectStoreName = { 
    TODO: 'todos', 
    USER: 'user',
    METADATA: 'metaData'
}; 

const OperationMode = {
    READ: 'readonly',
    READWRITE: 'readwrite'
};

export { 
    DATABASE_NAME, 
    DATABASE_VERSION, 
    ObjectStoreName,
    OperationMode
};