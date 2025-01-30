export const swap = (array, i, j) => {
    if(i<0 || j<0)
        return;
    else if(i >= array.length || j >= array.length)
        return;
    [array[i], array[j]] = [array[j], array[i]];
}

export const swapTask = (taskList, i, j) => {
    if(i<0 || j<0)
        return;
    else if(i >= taskList.length || j >= taskList.length)
        return;
    [taskList[i].index, taskList[j].index] = [taskList[j].index, taskList[i].index];
    [taskList[i], taskList[j]] = [taskList[j], taskList[i]];
}
