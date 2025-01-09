class App {


    init() {
        this.modal = document.getElementById('modal');
        this.closeBtn = document.getElementById('close-btn');
        this.updateTaskBtn = document.getElementById('update-task-btn');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.addToDoFormBtn = document.getElementById('add-todo-btn');
    }

    addEventListeners() {
        this.closeBtn.addEventListener('click', this.closeModal.bind(this));
        this.updateTaskBtn.addEventListener('click', this.updateTask.bind(this));
        this.addTaskBtn.addEventListener('click', this.addTask.bind(this));
        this.addToDoFormBtn.addEventListener('click', this.addToDoForm.bind(this));
    }
}

(() => {
    const app = new App();
})();