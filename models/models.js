export class Task {
    constructor(id, index, task, isDone, labels, timeStamp, updatedAt, completionTime) {
        this.id = id;
        this.index = index;
        this.task = task;
        this.isDone = isDone;
        this.labels = labels;
        this.timeStamp = timeStamp;
        this.updatedAt = updatedAt;
        this.completionTime = completionTime;
    }
}

export class User {
    constructor(id, email, name) {
        this.id = id;
        this.email = email;
        this.name = name;
    }
}

export class MetaData {
    constructor(changeSignature, timeStamp) {
        this.id = 'metadata';
        this.changeSignature = changeSignature;
        this.timeStamp = timeStamp;
    }
}