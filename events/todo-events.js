import { EventConstants } from "../constants/event-constants";

const todoLoadEvent = new Event(EventConstants.LOAD_TODO);
const updateTodoEvent = new Event(EventConstants.UPDATE_TODO);

export {
    todoLoadEvent, 
    updateTodoEvent
};