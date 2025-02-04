import { AppStore } from "./store/app-store.js";
import {
    DomHandler
} from "./events/dom-event-handler.js";
import { emitTodoLoadEvent, emitUpdateTodoEvent } from "./events/event-emitter.js";
import { EventHandler } from "./events/event-handler.js";
import { getTimeStamp, getTimeStampFromMills } from "./helpers/time-stamp-helper.js";
import { swap, swapTask } from "./helpers/array-helper.js";
import { TaskMonitor } from "./store/task-state-monitor.js";

class App {
    #appStore = null;
    #taskStateMonitor = TaskMonitor.getInstance();
    taskList = [];
    updateTime = null; 
    #shouldBackup = false;

    init() {
        console.log(">>>> App initializing ...");
        this.#appStore = AppStore.getInstance();
        this.taskList = this.#appStore.taskList;
        console.log(this.#appStore.taskList);
        
        this.#appStore.actionHandlers['AddNewTask'] = this.addNewTask.bind(this);
        this.#appStore.actionHandlers['LoadView'] = this.loadView.bind(this);
        this.#appStore.actionHandlers['UpdateTask'] = this.updateTask.bind(this);
        this.#appStore.actionHandlers['updateCheckbox'] = this.updateCheckbox.bind(this);
        console.log(">>>> App initialized");
    }

    loadView() {
        // first clear .task-list by removing all child under child-list div
        const taskListDiv = document.getElementById("task-list");
        var child = taskListDiv.lastChild;
        while(child) {
            taskListDiv.removeChild(child);
            child = taskListDiv.lastChild;
        }
        // sort according to isDone(if done then come first) and then according to index
        this.taskList.sort((a, b) => {
            if (a.isDone !== b.isDone) {
                return a.isDone - b.isDone; 
            }
            return a.index - b.index; 
        });
    
        this.taskList.forEach((taskElement, index) => {
    
            const taskBox = document.createElement("div");
            taskBox.setAttribute("class", taskElement.isDone ? "task-box done" : "task-box");
    
            // the task text
            const taskText = document.createElement("div");
            taskText.setAttribute("class", "task");
    
            // remove html tags 
            const textWithoutTags = taskElement.task.replace(/<[^>]+>/g, "");
            
            // replace markup tags with html tags
            const replacedText = textWithoutTags
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\[x\]/gi, `<input type='checkbox' checked>`)
            .replace(/\[\]/g, `<input type='checkbox'>`);;
            
            // replace links with <a>{link}</a> 
            const task = replacedText.replace(/(https?:\/\/\S+)/gi, '<a href="$1" target="__blank">$1</a>');
            taskText.innerHTML = "<strong>" + (index + 1) + "</strong>" + ". " + task;
            taskBox.appendChild(taskText);
    
            const checkBoxes = taskText.querySelectorAll("input[type='checkbox']");
            checkBoxes.forEach((checkBox, checkBoxIndex) => {
                checkBox.addEventListener("change", () => {
                    this.updateCheckbox(index, checkBoxIndex, checkBox.checked);
                });
            });
    
            if(taskElement.labels) {
                const labelsText = taskElement.labels;
                const labelsDiv = document.createElement("div");
                labelsDiv.setAttribute("class" , "labels");
                labelsText.split(',').map(label => label.trim()).forEach(label => {
                    const labelDiv = document.createElement("div");
                    labelDiv.setAttribute("class", "label");
                    labelDiv.innerText = label;
                    labelDiv.addEventListener("click", () => {
                        chrome.runtime.sendMessage({ 
                            action: 'loadByLabel', 
                            label: label 
                        }, emitTodoLoadEvent); 
                    });
                    labelsDiv.appendChild(labelDiv);
                });
                taskBox.appendChild(labelsDiv);
            }
            
            // task controller - for buttons and timestamp
            const taskController = document.createElement("div");
            taskController.setAttribute("class", "task-controller");
    
            // add the timestamp(the time of adding new task)
            const timeStampElement = document.createElement("span");
            timeStampElement.setAttribute("class", taskElement.isDone ? "timestamp done" : "timestamp");
            timeStampElement.innerText = getTimeStampFromMills(taskElement.timeStamp);
    
            const updatedTimeStampElement = document.createElement("span");
            updatedTimeStampElement.setAttribute("class", taskElement.isDone ? "timestamp done" : "timestamp");
            updatedTimeStampElement.innerText = (taskElement.updatedAt == null) ? "" : ("[Updated: " + getTimeStampFromMills(taskElement.updatedAt) + "]");
    
            // controller button group
            const controllerBtns = document.createElement("span");
            controllerBtns.setAttribute("class", "controller-btn");
            
            // button to mark done or to undo task 
            const doneBtn = document.createElement('button');
            doneBtn.className = 'done-btn';
            doneBtn.textContent = taskElement.isDone ? "Undo" : "Done";
    
            doneBtn.addEventListener("click", () => {
                this.taskList[index].isDone = !this.taskList[index].isDone;
                this.taskList[index].completionTime = getTimeStamp();
                emitUpdateTodoEvent();
            });

            controllerBtns.appendChild(doneBtn);
    
            // move up button
            const moveUpBtn = document.createElement('button');
            moveUpBtn.className = 'move-up-btn';
            moveUpBtn.textContent = '↑';
            moveUpBtn.addEventListener("click", () => {
                if(this.taskList[index].isDone)
                {
                    alert("The task is completed. Completed task cannot be moved!");
                    return;
                }
                swapTask(this.taskList, index, index-1);
                // this.#taskStateMonitor.addOrUpdateTaskss([this.taskList[index], this.taskList[index+1]]);
                emitUpdateTodoEvent();
            });
            controllerBtns.appendChild(moveUpBtn);
    
            // move down button
            const moveDownBtn = document.createElement('button');
            moveDownBtn.className = 'move-down-btn';
            moveDownBtn.textContent = '↓';
            moveDownBtn.addEventListener("click", () => {
                if(this.taskList[index].isDone)
                {
                    alert("The task is completed. Completed task cannot be moved!");
                    return;
                }
                swapTask(this.taskList, index, index+1);
                // this.#taskStateMonitor.addOrUpdateTaskss([this.taskList[index], this.taskList[index+1]]);
                emitUpdateTodoEvent();
            });
            controllerBtns.appendChild(moveDownBtn);
    
            // button for editing task
            const editTaskBtn = document.createElement('button');
            editTaskBtn.className = 'edit-task-btn';
            editTaskBtn.textContent = 'Edit';
            
            editTaskBtn.addEventListener("click", () => {
                if(this.taskList[index].isDone)
                {
                    alert("The task is completed. Completed task cannot be updated!");
                    return;
                }
                modal.style.display = 'block';
                modal.scrollIntoView();
                document.getElementById('task-input-updated').value = taskElement.task;
                document.getElementById('hidden-index-updated').value = index;
            });
            controllerBtns.appendChild(editTaskBtn);
    
            // button for deleting task
            const delTaskBtn = document.createElement('button');
            delTaskBtn.className = 'del-task-btn';
            delTaskBtn.textContent = 'Delete';
            delTaskBtn.addEventListener("click", () => {
                let x = prompt("Are you sure? This can't be undone!\nWrite 1 to delete.");
                if(x == 1)
                {
                    this.taskList.splice(index, 1);
                    emitUpdateTodoEvent();
                }
            });
            controllerBtns.appendChild(delTaskBtn);
    
            // append childs - timestampElement, controllerBtns->task-controller->taskbox
            taskController.appendChild(timeStampElement);
            if(!this.taskList[index].isDone)
                taskController.appendChild(updatedTimeStampElement);
    
             // add completion time for tasks that are done
             if(this.taskList[index].isDone)
             {
                 const completionTime = document.createElement("div");
                 completionTime.setAttribute("class","timeStamp");
                 completionTime.innerText = "[Completed: " + this.taskList[index].completionTime + "]";
                 taskController.appendChild(completionTime);
             }
             
            taskController.appendChild(controllerBtns);
            taskBox.appendChild(taskController);
    
            // append everything to task-list div
            document.getElementById("task-list").appendChild(taskBox);
            
        })
    }
    
    updateCheckbox (taskIndex, checkBoxIndex, isChecked) {
        let task = this.taskList[taskIndex].task;
        const regex = /\[\s*x?\s*\]\s/g;
        let i = 0;
        task = task.replace(regex, (match) => {
            if (i++ === checkBoxIndex) {
                return (isChecked ? "[x] " : "[] ");
            } else {
                return match;
            }
        });
        this.taskList[taskIndex].task = task;
        this.taskList[taskIndex].updatedAt = Date.now();
        emitUpdateTodoEvent();
    }

    /**
     * function to Add New Task in todo list
     * @param {String} priority the priority of the task
     * @param {String} taskItem the task to be listed in todo list
     * @returns if task is null
     */
    addNewTask(priority, taskItem) {
        if(taskItem.task === null || taskItem.task.trim() === "")
        {
            alert("Task field is empty!");
            return;
        }
        (priority === 'low') ? this.taskList.push(taskItem) : this.taskList.unshift(taskItem);
        emitUpdateTodoEvent();
    }

    updateTask(index, updatedTask) {
        this.taskList[index].task = updatedTask;
        this.taskList[index].updatedAt = Date.now();
        emitUpdateTodoEvent();
    }
}

(() => {

    console.log(">>>> App started");

    const app = new App();
    app.init();
    const domEventListener = new DomHandler();
    domEventListener.attachDomEventListeners();
    EventHandler.registerEventListeners();

    document.addEventListener("DOMContentLoaded", () => {
        console.log(">>>> DOM content loaded...");

        chrome.runtime.sendMessage({ 
            action: 'loadData'
        }, emitTodoLoadEvent);

        chrome.runtime.sendMessage({
            action: 'syncTodo'
        }, emitTodoLoadEvent);
    });

})();