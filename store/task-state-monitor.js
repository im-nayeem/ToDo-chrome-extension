class TaskStateMonitor {
  constructor() {
    this.tasks = [];
    this.changeTracker = {
      'Create': [],
      'Update': [],
      'Delete': []
    };
  }

  addOrUpdateTask(task) {
    const index = this.tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
        this.tasks[index] = task;
        return;
    }
    this.tasks.push(task);
  }

  addTaskToDelete(task) {
    const index = this.tasks['Update'].findIndex(t => t.id === task.id);
    if (index !== -1) {
      this.tasks['Update'].splice(index, 1);
    }
    this.tasks['Delete'].push(task);
  }

  addOrUpdateTasks(tasks) {
    tasks.forEach(task => {
        this.addorUpdateTask(task);
    });
  }

  removeTask(task) {
    const index = this.tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      this.tasks.splice(index, 1);
    }
  }

  getTasks() {
    return this.tasks;
  }
}

const taskStateMonitor = new TaskStateMonitor();
class TaskMonitor {
    static getInstance() {
        return taskStateMonitor;
    }
}

export { TaskMonitor };
