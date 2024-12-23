export class TaskModel {
    constructor(id, index, task, isDone, labels, completionTime, updatedAt) {
        this.id = id;
        this.index = index;
        this.task = task;
        this.isDone = isDone;
        this.labels = labels;
        this.completionTime = completionTime;
        this.updatedAt = updatedAt;
    }
}

export class UserModel {
    constructor(id, email, name) {
        this.id = id;
        this.email = email;
        this.name = name;
    }
}

export class MetaData {
    constructor(changeSignature, timeStamp) {
        this.changeSignature = changeSignature;
        this.timeStamp = timeStamp;
    }
}