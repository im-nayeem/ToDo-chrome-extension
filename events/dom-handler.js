import { AppStore } from '../store/app-store.js';
export class DomHandler {
    #appStore = null;

    constructor() {
        this.#appStore = AppStore.getInstance();
        this.taskList = this.#appStore.taskList;
        
        this.modal = document.getElementById('modal');
        this.closeBtn = document.getElementById('close-btn');
        this.updateTaskBtn = document.getElementById('update-task-btn');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.addToDoFormBtn = document.getElementById('add-todo-btn');

        this.toggleToDoForm = this.toggleToDoForm.bind(this);
        this.onCollapseButtonClick = this.onCollapseButtonClick.bind(this);
        this.onUpdateTaskButtonClick = this.onUpdateTaskButtonClick.bind(this);
        this.onAddTaskButtonClicked = this.onAddTaskButtonClicked.bind(this);
    }

    // Method to attach event listeners to DOM elements
    attachDomEventListeners() {
        console.log('Attaching event listeners...');
        if (this.addToDoFormBtn) {
            this.addToDoFormBtn.addEventListener('click', this.toggleToDoForm);
            console.log('Event listener attached to Add ToDo Form Button');
            console.log(this.addToDoFormBtn);
        }

        const collapseButton = document.getElementById('collapse-btn');
        if (collapseButton) {
            collapseButton.addEventListener('click', this.onCollapseButtonClick);
            console.log('Event listener attached to Collapse Button');
            console.log(collapseButton);
        }

        const updateTaskButton = document.getElementById('update-task-btn');
        if (updateTaskButton) {
            updateTaskButton.addEventListener('click', this.onUpdateTaskButtonClick);
            console.log('Event listener attached to Update Task Button');
            console.log(updateTaskButton);
        }

        const addTaskButton = document.getElementById('add-task-btn');
        if (addTaskButton) {
            addTaskButton.addEventListener('click', this.onAddTaskButtonClicked);
            console.log('Event listener attached to Add Task Button');
            console.log(addTaskButton);
        }
    }

    toggleToDoForm() {
        const todoForm = document.getElementById('todo-input-form');
        if (todoForm.style.display === 'block') {
            todoForm.style.display = 'none';
            this.addToDoFormBtn.innerText = '+';
            this.addToDoFormBtn.style.padding = "5px 10px";
        } else {
            todoForm.style.display = 'block';
            this.addToDoFormBtn.innerText = '-';
            this.addToDoFormBtn.style.padding = "5px 13px";
        }
    }

    onCollapseButtonClick(event) {
        this.modal.style.display = 'none';
    }

    onUpdateTaskButtonClick(event) {
        let x = prompt("Are you sure to edit? This can't be undone!\nWrite 1 to edit.");
        if (x == 1) {
            const ind = document.getElementById('hidden-index-updated').value;
            const updatedTask = document.getElementById('task-input-updated').value;
            this.taskList[ind].task = updatedTask;
            this.taskList[ind].updatedAt = this.getTimeStamp();
            this.updateTime = Date.now();
        }
        this.modal.style.display = 'none';
    }

    onAddTaskButtonClicked(event) {
        const task = document.getElementById('task-input').value;
        const labels = document.getElementById('labelsInput').value.trim();
        const checkedRadio = document.querySelector('input[name="priority"]:checked');
        if (checkedRadio) {
            const priority = checkedRadio.value;
            document.getElementById('task-input').value = "";
            document.getElementById('labelsInput').value = "";
            checkedRadio.checked = false;
            this.toggleToDoForm();
            this.#appStore.actionHandlers['AddNewTask'](priority, task, labels, false);
        } else {
            alert("Priority must be selected!");
        }
    }

    // Example timestamp method
    getTimeStamp() {
        return new Date().toISOString();
    }
}
