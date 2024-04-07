const autocomplete = (labelField, labelList) => {
    let currentFocus;

    labelField.addEventListener("input", function(e) {
        closeAllLists();
        const val = this.value.trim();
        if (!val) return;
        const labels = val.split(',').map(label => label.trim());
        labels.forEach(label => createAutocompleteList(label));
    });

    const createAutocompleteList = (label) => {
        currentFocus = -1;

        const matchingItems = labelList.filter(item => 
            item.toUpperCase().startsWith(label.toUpperCase().trim()));

        const listContainer = document.createElement("div");
        listContainer.setAttribute("class", "autocomplete-items");
        labelField.parentNode.appendChild(listContainer);

        matchingItems.forEach(item => {
            if(!item) return;
            const suggestion = document.createElement("div");
            suggestion.innerHTML = "<strong>" + item.substr(0, label.length) + "</strong>";
            suggestion.innerHTML += item.substr(label.length);
            suggestion.innerHTML += "<input type='hidden' value='" + item + "'>";

            suggestion.addEventListener("click", function() {
                const selectedValue = this.getElementsByTagName("input")[0].value;
                const updatedLabels = labelField.value.split(',').map(l => l.trim());
                updatedLabels[updatedLabels.indexOf(label)] = selectedValue;
                labelField.value = updatedLabels.join(', ');
                closeAllLists();
            });

            listContainer.appendChild(suggestion);
        });
    }

    labelField.addEventListener("keydown", (e) => {
        const list = document.getElementsByClassName("autocomplete-items");
        if (!list.length) return;

        console.log(list);
        const suggestions = list[list.length - 1].getElementsByTagName("div");
        if (e.keyCode === 40) {
            currentFocus = (currentFocus + 1) % suggestions.length;
            addActive(suggestions);
        } else if (e.keyCode === 38) {
            currentFocus = (currentFocus - 1 + suggestions.length) % suggestions.length;
            addActive(suggestions);
        } else if (e.keyCode === 13) {
            e.preventDefault();
            if (currentFocus > -1) {
                suggestions[currentFocus].click();
            }
        }
    });

    function addActive(suggestions) {
        removeActive(suggestions);
        if (currentFocus >= 0 && currentFocus < suggestions.length) {
            suggestions[currentFocus].classList.add("autocomplete-active");
        }
    }

    function removeActive(suggestions) {
        for (let i = 0; i < suggestions.length; i++) {
            suggestions[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        const lists = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < lists.length; i++) {
            if (elmnt != lists[i] && elmnt != labelField) {
                lists[i].parentNode.removeChild(lists[i]);
            }
        }
    }

    document.addEventListener("click", (e) => {
        closeAllLists(e.target);
    });
}

document.getElementById('add-todo-btn').addEventListener("click", () => {
    chrome.runtime.sendMessage({ 
        action: 'loadData', 
        }, (data) => {
            const todos = data.taskList;
            let labelsList = [];
            todos.forEach(task => {
                if(task.labels !== undefined)
                {
                    task.labels.split(',').map(label => label.trim()).forEach(label => {
                        labelsList.push(label);
                    });
                }
            });
            const uniqueLabels = Array.from(new Set(labelsList));
            autocomplete(document.getElementById("labelsInput"), uniqueLabels);
        }); 
});

