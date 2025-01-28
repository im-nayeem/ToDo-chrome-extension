import { getTimeStamp } from "./helpers/time-stamp-helper.js";
import { swap } from "./helpers/array-helper.js";
import { todoLoadEvent, updateTodoEvent } from "./events/todo-events.js";
import { EventConstants } from "./constants/event-constants.js";
import { AppStore } from "./store/app-store.js";

const modal = document.getElementById('modal');
const closeBtn = document.getElementById('close-btn');
const updateTaskBtn = document.getElementById('update-task-btn');
const addTaskBtn = document.getElementById('add-task-btn');
const addToDoFormBtn = document.getElementById('add-todo-btn');

let shouldBackup = false;
// Copyright (c) 2023 Nayeem Hossain

let appStore = AppStore.getInstance();

let taskList = []; 
    // array to store all task object containing task,timestamp and isDone
let updateTime = 0;

/**================= Functions ====================== */

/**------function to load the view-------*/
const loadView = () => {

    //first clear .task-list by removing all child under child-list div
    const taskListDiv = document.getElementById("task-list");

    var child = taskListDiv.lastChild;
    while(child) {
        taskListDiv.removeChild(child);
        child = taskListDiv.lastChild;
    }

    //sort according to isDone(if done then come first)
    taskList.sort( (a, b) => {
        return (a.isDone - b.isDone);
    });

    taskList.forEach((Element,index) => {

        const taskBox = document.createElement("div");
        taskBox.setAttribute("class", Element.isDone ? "task-box done" : "task-box");

        // the task text
        const taskText = document.createElement("div");
        taskText.setAttribute("class" , "task");

        // remove html tags 
        const textWithoutTags = Element.task.replace(/<[^>]+>/g, "");
        
        // replace **text** with <strong>text</strong>
        const replacedText = textWithoutTags.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\[x\]/gi, `<input type='checkbox' checked>`).replace(/\[\]/g, `<input type='checkbox'>`);;
        
        // replace links with <a>link</a> 
        const task = replacedText.replace(/(https?:\/\/\S+)/gi, '<a href="$1" target="__blank">$1</a>');
        taskText.innerHTML = "<strong>" + (index+1) + "</strong>" + ". " + task;
        taskBox.appendChild(taskText);

        const checkBoxes = taskText.querySelectorAll("input[type='checkbox']");
        checkBoxes.forEach((checkBox, checkBoxIndex) => {
            checkBox.addEventListener("change", () => {
                updateCheckbox(index, checkBoxIndex, checkBox.checked);
            });
        });

        if(Element.labels) {
            const labelsText = Element.labels;
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
        const timeStamp = document.createElement("span");
        timeStamp.setAttribute("class", Element.isDone ? "timestamp done" : "timestamp");
        timeStamp.innerText = Element.timeStamp;

        const updatedTimeStamp = document.createElement("span");
        updatedTimeStamp.setAttribute("class", Element.isDone ? "timestamp done" : "timestamp");
        updatedTimeStamp.innerText = (Element.updatedAt == null) ? "" : ("[Updated: " + Element.updatedAt + "]");

        // controller button group
        const controllerBtns = document.createElement("span");
        controllerBtns.setAttribute("class", "controller-btn");
        
        // button to mark done or to undo task 
        const doneBtn = document.createElement('button');
        doneBtn.className = 'done-btn';
        doneBtn.textContent = Element.isDone ? "Undo" : "Done";

        doneBtn.addEventListener("click", () => {
            taskList[index].isDone = !taskList[index].isDone;
            taskList[index].completionTime = getTimeStamp();
            updateTime = Date.now();
            emitUpdateTodoEvent(shouldBackup);
        });
        controllerBtns.appendChild(doneBtn);

        // move up button
        const moveUpBtn = document.createElement('button');
        moveUpBtn.className = 'move-up-btn';
        moveUpBtn.textContent = '↑';
        moveUpBtn.addEventListener("click", () => {
            if(taskList[index].isDone)
            {
                alert("The task is completed. Completed task cannot be moved!");
                return;
            }
            swap(taskList, index,index-1);
            updateTime = Date.now();
            emitUpdateTodoEvent(shouldBackup);
        });
        controllerBtns.appendChild(moveUpBtn);

        // move down button
        const moveDownBtn = document.createElement('button');
        moveDownBtn.className = 'move-down-btn';
        moveDownBtn.textContent = '↓';
        moveDownBtn.addEventListener("click", () => {
            if(taskList[index].isDone)
            {
                alert("The task is completed. Completed task cannot be moved!");
                return;
            }
            swap(taskList, index,index+1);
            updateTime = Date.now();
            emitUpdateTodoEvent(shouldBackup);
        });
        controllerBtns.appendChild(moveDownBtn);

        // button for editing task
        const editTaskBtn = document.createElement('button');
        editTaskBtn.className = 'edit-task-btn';
        editTaskBtn.textContent = 'Edit';
        
        editTaskBtn.addEventListener("click", () => {
           
            if(taskList[index].isDone)
            {
                alert("The task is completed. Completed task cannot be updated!");
                return;
            }

            modal.style.display = 'block';
            modal.scrollIntoView();
            document.getElementById('task-input-updated').value = Element.task;
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
                taskList.splice(index, 1);
                updateTime = Date.now();
                emitUpdateTodoEvent(shouldBackup);
            }
        })
        controllerBtns.appendChild(delTaskBtn);

        // append childs - timestamp,controllerBtns->task-controller->taskbox
        taskController.appendChild(timeStamp);

        if(!taskList[index].isDone)
            taskController.appendChild(updatedTimeStamp);

         // add completion time for tasks that are done
         if(taskList[index].isDone)
         {
             const completionTime = document.createElement("div");
             completionTime.setAttribute("class","timeStamp");
             completionTime.innerText = "[Completed: " + taskList[index].completionTime + "]";
             taskController.appendChild(completionTime);
         }
         
        taskController.appendChild(controllerBtns);
        taskBox.appendChild(taskController);

        // append everything to task-list div
        document.getElementById("task-list").appendChild(taskBox);
        
    })
}


const updateCheckbox = (taskIndex, checkBoxIndex, isChecked) => {
    let task = taskList[taskIndex].task;
    const regex = /\[\s*x?\s*\]\s/g;
    let i = 0;
    task = task.replace(regex, (match) => {
        if (i++ === checkBoxIndex) {
            return (isChecked ? "[x] " : "[] ");
        } else {
            return match;
        }
    });

    taskList[taskIndex].task = task;
    taskList[taskIndex].updatedAt = getTimeStamp();
    updateTime = Date.now();
    emitUpdateTodoEvent(shouldBackup);
}


// function to Toggle Task Input Form
const toggleToDoForm = () => {

    const todoForm = document.getElementById('todo-input-form');

    if(todoForm.style.display == 'block')
    {
        todoForm.style.display = 'none';
        addToDoFormBtn.innerText = '+';  
        addToDoFormBtn.style.padding = "5px 10px"; 

    }
    else
    {
        todoForm.style.display = 'block';
        addToDoFormBtn.innerText = '-';
        addToDoFormBtn.style.padding = "5px 13px"; 
    }
}

/**
 * function to Add New Task in todo list
 * @param {String} priority the priority of the task
 * @param {String} task the task to be listed in todo list
 * @param {Boolean} isDone indicating if the task is done or undone
 * @returns if task is null
 */
const addNewTask = (priority, task, labels, isDone) => {
   
    toggleToDoForm();

    if(task === null || task.trim() === "")
    {
        alert("Task field is empty!");
        return;
    }

    let timeStamp = getTimeStamp();

    if(priority === 'low')
        taskList.push( {task, isDone, labels, timeStamp} );
    else
        taskList.unshift( {task, isDone, labels, timeStamp} );

    updateTime = Date.now();
    emitUpdateTodoEvent(shouldBackup);
}

/**--------Event Emitter----------- */



// emit event to sync todo with cloud
const syncTodo = async() => {
    chrome.runtime.sendMessage({ 
        action: 'syncTodo', 
    }, emitTodoLoadEvent); 
}


/**======== Event Listeners for buttons and divs ======== */

addToDoFormBtn.addEventListener("click", toggleToDoForm);

closeBtn.addEventListener("click", (event) => {
    modal.style.display = 'none';
})


// add event listener to update task button in modal
updateTaskBtn.addEventListener("click", (event) => {
    let x = prompt("Are you sure to edit? This can't be undone!\nWrite 1 to edit.");
    if(x == 1)
    {
        const ind = document.getElementById('hidden-index-updated').value;
        const updatedTask = document.getElementById('task-input-updated').value;
        taskList[ind].task = updatedTask;
        taskList[ind].updatedAt = getTimeStamp();
        updateTime = Date.now();
        emitUpdateTodoEvent(shouldBackup);
    }
    modal.style.display = 'none';
});


// button to add high priority task
addTaskBtn.addEventListener("click", (event) => {
    const task = document.getElementById('task-input').value;
    const labels = document.getElementById('labelsInput').value.trim();
    var checkedRadio = document.querySelector('input[name="priority"]:checked');
    if(checkedRadio)
    {
        const priority = checkedRadio.value;
        document.getElementById('task-input').value = "";
        document.getElementById('labelsInput').value = "";
        checkedRadio.value = "";
        addNewTask(priority, task, labels, false);
    }
    else
    {
        alert("Priority must be selected!");
    }

});

// emit event to load the view
const emitTodoLoadEvent = (data) => {
    if(data == undefined)
    {
        console.log(">>>> No data found to emit todoLoadEvent");
        return;
    }
    console.log(data);
    taskList = data.taskList;
    updateTime = data.updateTime;
    document.dispatchEvent(todoLoadEvent);
}

// emit event to update todo (used only in popup.js)
const emitUpdateTodoEvent = () => {
    if(!shouldBackup) {
        chrome.runtime.connect({ name: "backup" });
        shouldBackup = true;
    }
    document.dispatchEvent(updateTodoEvent);
}


document.addEventListener(EventConstants.LOAD_TODO, (event) => {
    loadView();
});

document.addEventListener(EventConstants.UPDATE_TODO, (event) => {
    chrome.runtime.sendMessage({ 
        action: 'updateTodo', 
        taskList: taskList, updateTime: updateTime 
    }, emitTodoLoadEvent); 
});

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM content loaded...");
    chrome.runtime.sendMessage({ 
        action: 'loadData'
    }, emitTodoLoadEvent); 
    syncTodo();
});

(() => {
    console.log("Initializing...");
    appStore.actionHandlers['loadTodo'] = loadView.bind(this);
})();

/* ------------------------------------------ */
