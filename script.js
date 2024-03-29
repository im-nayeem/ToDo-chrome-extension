const modal = document.getElementById('modal');
const closeBtn = document.getElementById('close-btn');
const updateTaskBtn = document.getElementById('update-task-btn');

const addTaskBtnHigh = document.getElementById('add-task-btn-high');
const addTaskBtnLow = document.getElementById('add-task-btn-low');

const addToDoFormBtn = document.getElementById('add-todo-btn');

const baseUrl = "http://localhost:8080/";
    
// Copyright (c) 2023 Nayeem Hossain

taskList = []; 
    // array to store all task object containing task,timestamp and isDone
updateTime = 0;

/**================= Functions ====================== */

const getTimeStamp = () => {
    
    const currentDate = new Date();
    
    const currentTime = currentDate.toLocaleString('en-BD', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
    
    const formattedDate = currentDate.toLocaleDateString('en-BD', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
  
    const formattedTimeStamp = `${formattedDate} | ${currentTime}`;
  
    return formattedTimeStamp;
  }
  
const swap = (i, j) => {

    if(i<0 || j<0)
        return;
    else if(i >= taskList.length || j >= taskList.length)
        return;
    [taskList[i], taskList[j]] = [taskList[j], taskList[i]];
}

const storeToDoLocally = () => {
    localStorage.setItem("todo", JSON.stringify(taskList));
    localStorage.setItem("updateTime", updateTime);
    fetchAndLoadView();
}

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
    })

    taskList.forEach((Element,index) =>{


        const taskBox = document.createElement("div");
        taskBox.setAttribute("class", Element.isDone ? "task-box done" : "task-box");



        // the task text
        const taskText = document.createElement("div");
        taskText.setAttribute("class" , "task");

        // remove html tags 
        const textWithoutTags = Element.task.replace(/<[^>]+>/g, "");
        // replace **text** with <strong>text</strong>
        const replacedText = textWithoutTags.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        // replace links with <a>link</a> 
        const task = replacedText.replace(/(https?:\/\/\S+)/gi, '<a href="$1" target="__blank">$1</a>');

        taskText.innerHTML = "<strong>" + (index+1) + "</strong>" + ". " + task;
        taskBox.appendChild(taskText);



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


        //controller button group
        const controllerBtns = document.createElement("span");
        controllerBtns.setAttribute("class", "controller-btn");
        

        
        //button to mark done or to undo task 
        const doneBtn = document.createElement('button');
        doneBtn.className = 'done-btn';
        doneBtn.textContent = Element.isDone ? "Undo" : "Done";

        doneBtn.addEventListener("click",() => {

            taskList[index].isDone = !taskList[index].isDone;
            taskList[index].completionTime = getTimeStamp();
            updateTime = Date.now();
            storeToDoLocally();
            loadView();
        
        })
        controllerBtns.appendChild(doneBtn);



        //move up button
        const moveUpBtn = document.createElement('button');
        moveUpBtn.className = 'move-up-btn';
        moveUpBtn.textContent = '↑';
        moveUpBtn.addEventListener("click", () => {
            if(taskList[index].isDone)
            {
                alert("The task is completed. Completed task cannot be moved!");
                return;
            }

            swap(index,index-1);
            updateTime = Date.now();
            storeToDoLocally();
            loadView();
        });
        controllerBtns.appendChild(moveUpBtn);


        //move down button
        const moveDownBtn = document.createElement('button');
        moveDownBtn.className = 'move-down-btn';
        moveDownBtn.textContent = '↓';
        moveDownBtn.addEventListener("click", () => {
            if(taskList[index].isDone)
            {
                alert("The task is completed. Completed task cannot be moved!");
                return;
            }

            swap(index,index+1);
            updateTime = Date.now();
            storeToDoLocally();
            loadView();
        });
        controllerBtns.appendChild(moveDownBtn);


        //button for editing task
        const editTaskBtn = document.createElement('button');
        editTaskBtn.className = 'edit-task-btn';
        editTaskBtn.textContent = 'Edit';
        
        editTaskBtn.addEventListener("click",() => {
           
            if(taskList[index].isDone)
            {
                alert("The task is completed. Completed task cannot be updated!");
                return;
            }

            modal.style.display = 'block';
            modal.scrollIntoView();
            document.getElementById('task-input-updated').value = Element.task;
            document.getElementById('hidden-index-updated').value = index;
        
        })
        controllerBtns.appendChild(editTaskBtn);



        //button for deleting task
        const delTaskBtn = document.createElement('button');
        delTaskBtn.className = 'del-task-btn';
        delTaskBtn.textContent = 'Delete';

        delTaskBtn.addEventListener("click", () => {

            let x = prompt("Are you sure? This can't be undone!\nWrite 1 to delete.");
            if(x == 1)
            {
                taskList.splice(index, 1);
                updateTime = Date.now();
                storeToDoLocally();
                loadView();
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
const addNewTask = (priority, task, isDone) => {
   
    toggleToDoForm();

    if(task === null || task.trim() === "")
    {
        alert("Task field is empty!");
        return;
    }

    let timeStamp = getTimeStamp();

    if(priority === 'low')
        taskList.push( {task, isDone, timeStamp} );
    else
        taskList.unshift( {task, isDone, timeStamp} );

    updateTime = Date.now();
    storeToDoLocally();
    loadView();
}


 


/**======== add Event Listeners to buttons and divs ======== */

addToDoFormBtn.addEventListener("click", toggleToDoForm);

closeBtn.addEventListener("click", () => {
    modal.style.display = 'none';
})


// add event listener to update task button in modal
updateTaskBtn.addEventListener("click", () => {

    let x = prompt("Are you sure to edit? This can't be undone!\nWrite 1 to edit.");
    if(x == 1)
    {
        const ind = document.getElementById('hidden-index-updated').value;
        const updatedTask = document.getElementById('task-input-updated').value;

        taskList[ind].task = updatedTask;
        taskList[ind].updatedAt = getTimeStamp();

        updateTime = Date.now();
        storeToDoLocally();
    }

    modal.style.display = 'none';
    loadView();

})


// button to add high priority task
addTaskBtnHigh.addEventListener("click", () => {

    const taskHigh = document.getElementById('task-input-high').value;
    document.getElementById('task-input-high').value = "";
    addNewTask("high",taskHigh,false);

})

//button to add low priority task
addTaskBtnLow.addEventListener("click", () => {

    const taskLow = document.getElementById('task-input-low').value;
    document.getElementById('task-input-low').value = "";
    addNewTask("low", taskLow, false);

})
const isInternetConnected = (callback) => {
    fetch('https://www.google.com', { method: 'HEAD', mode: 'no-cors'})
        .then(response => {
            callback(true);
        })
        .catch(error => {
             callback(false);
        });
}
const fetchAndLoadView = () => {
    isInternetConnected((isConnected) => {
        if(isConnected) {
            let apiUrl = baseUrl + 'api/get-todo.php';
            fetch(apiUrl)
            .then(response => response.json())
                .then(data => {
                if(data.status === 401) 
                    window.open(baseUrl + 'account/signin.php', '_blank');
                else if(data.status === 200) 
                {
                    if(data.result !== null && data.result.updateTime > updateTime)
                    {
                        taskList = data.result.todo;
                        updateTime = data.result.updateTime;
                        storeToDoLocally();
                        loadView();
                    }
                    else if(data.result == null || data.result.updateTime < updateTime)
                    {
                        fetch(baseUrl + "api/update-todo.php", {
                            method: "POST",
                            body: JSON.stringify({"updateTime":updateTime, "todo":taskList}),
                            headers: {
                                "Content-type": "application/json"
                            }
                        })
                        .then((response) => response.json())
                            .then((json) => {
                                alert('Back-up completed!');
                                console.log(json);
                            })
                                .catch(error => {
                                    alert(error);
                        });
                    }
                }
                else {
                    alert("Error while fetching data from server!");
                    throw new Error(`API error! Status: ${data.status}`);
                }
            })
            .catch(error => {
                alert("Error while connecting with server!");
                console.error('Fetch error:', error);
            });
        }else{
            return;
        }
    });
 }

document.addEventListener("DOMContentLoaded", () => {
    const toDoList = JSON.parse(localStorage.getItem("todo"));
    updateTime = localStorage.getItem("updateTime");
    if(updateTime == null)
        updateTime = 0;
    if(toDoList !== null)
        taskList = [...toDoList];
    loadView();
    fetchAndLoadView();
})

/**------------------------------------------ */

