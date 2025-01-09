export class Task {
    constructor(id, index, task, isDone, labels, completionTime, updatedAt, author) {
        this.id = id;
        this.index = index;
        this.task = task;
        this.isDone = isDone;
        this.labels = labels;
        this.completionTime = completionTime;
        this.updatedAt = updatedAt;
        this.author = author;
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
        this.changeSignature = changeSignature;
        this.timeStamp = timeStamp;
    }
}