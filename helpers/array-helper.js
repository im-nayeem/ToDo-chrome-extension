export const swap = (array, i, j) => {
    if(i<0 || j<0)
        return;
    else if(i >= array.length || j >= array.length)
        return;
    [array[i], array[j]] = [array[j], array[i]];
}
