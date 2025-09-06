// Highlight a selected todo and load its details
function loadTodoDetail(todoId) {
    // Remove active state from all todo items
    document.querySelectorAll('.todo-item').forEach(item => {
        item.classList.remove('active');
        const title = item.querySelector('.todo-title');
        if (title) title.classList.remove('active-title');
    });

    // Add active state to clicked todo
    const activeItem = document.querySelector(`[data-todo-id="${todoId}"]`);
    activeItem.classList.add('active');
    const activeTitle = activeItem.querySelector('.todo-title');
    if (activeTitle) activeTitle.classList.add('active-title');

    // Switch from empty state to detail view
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('todoDetail').style.display = 'block';

    // Fetch task details from backend
    fetch("/details", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({todoid: todoId})
    })
        .then(response => response.json())
        .then(todo => {
            updateTodoDetail(todo);
            document.getElementById("deleteButton").onclick = () => deleteTodo(todo.id);
            document.getElementById("completeButton").onclick = () => markComplete(todo.id);
        })
        .catch(err => console.error("Error fetching todo details:", err));
}


// Update detail panel with todo info
function updateTodoDetail(todo) {
    document.getElementById('todoTitle').textContent = todo.title;

    // Set priority badge with correct color
    const priorityElement = document.getElementById('todoPriority');
    priorityElement.textContent = `${todo.priority} Priority`;
    priorityElement.className = `badge fs-6 bg-${
        todo.priority.toLowerCase() === 'high' ? 'danger' :
        todo.priority.toLowerCase() === 'medium' ? 'warning' : 'success'
    }`;

    // Fill in details
    document.getElementById('todoStatus').textContent = todo.completed ? "Completed" : "Pending";
    document.getElementById('todoDueDate').textContent = todo.complete_time || "-";
    document.getElementById('todoCreated').textContent = todo.created_at || "-";
    document.getElementById('todoDescription').innerHTML = `<p class="mb-0">${todo.description}</p>`;

    // Render subtasks with checkboxes
    const subtasksContainer = document.getElementById('todoSubtasks');
    subtasksContainer.innerHTML = '';
    (todo.subtasks || []).forEach((subtask, index) => {
        const subtaskDiv = document.createElement('div');
        subtaskDiv.className = 'form-check mb-2';
        subtaskDiv.innerHTML = `
            <input class="form-check-input" type="checkbox" id="subtask${index}" ${subtask.completed ? 'checked' : ''} onclick="toggleSubtask(${todo.id}, ${index}, this.checked)">
            <label class="form-check-label ${subtask.completed ? 'text-decoration-line-through text-muted' : ''}" for="subtask${index}">
                ${subtask.text}
            </label>
        `;
        subtasksContainer.appendChild(subtaskDiv);
    });
}


// Mark todo as complete
function markComplete(todoId) {
    if (confirm('Are you sure you want to mark this task as complete?')) {
        fetch(`/complete`, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({todoid: todoId})
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove from list and reset detail panel
                    document.querySelector(`[data-todo-id="${todoId}"]`)?.remove();
                    document.getElementById("todoDetail").style.display = "none";
                    document.getElementById("emptyState").style.display = "block";
                } else {
                    alert("Failed to update task: " + data.error);
                }
            })
            .catch(err => {
                console.error("Error updating task:", err);
                alert("Something went wrong while updating task.");
            });
    }
}


// Delete a todo
function deleteTodo(todoId) {
    if (confirm('Are you sure you want to delete this task?')) {
        fetch("/delete", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({todoid: todoId})
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove todo and reset detail panel
                    document.querySelector(`[data-todo-id="${todoId}"]`)?.remove();
                    document.getElementById("todoDetail").style.display = "none";
                    document.getElementById("emptyState").style.display = "block";
                } else {
                    alert("Failed to delete task: " + data.error);
                }
            })
            .catch(err => {
                console.error("Error deleting task:", err);
                alert("Something went wrong while deleting.");
            });
    }
}


// Toggle a subtask checkbox
function toggleSubtask(todoId, subtaskIndex, isChecked) {
    // Update UI immediately
    const label = document.querySelector(`#subtask${subtaskIndex}`).nextElementSibling;
    if (isChecked) {
        label.classList.add("text-decoration-line-through", "text-muted");
    } else {
        label.classList.remove("text-decoration-line-through", "text-muted");
    }

    // Sync with backend
    fetch("/update-subtask", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            todoid: todoId,
            subtask_index: subtaskIndex,
            completed: isChecked
        })
    })
        .then(res => res.json())
        .then(data => {
            if (!data.success) alert("Failed to update subtask: " + data.error);
        })
        .catch(err => console.error("Error updating subtask:", err));
}


// Quick inline edit form for a todo
function editTodo() {
    const activeItem = document.querySelector('.todo-item.active');
    if (!activeItem) {
        alert('Please select a task to edit');
        return;
    }
    const todoId = activeItem.getAttribute('data-todo-id');

    // Get current values
    const currentTitle = document.getElementById('todoTitle').textContent;
    const currentDescription = document.getElementById('todoDescription').innerHTML;
    const currentPriority = document.getElementById('todoPriority').textContent.replace(' Priority', '').toLowerCase();
    const currentDueDate = document.getElementById('todoDueDate').textContent;

    // Collect subtasks
    const subtasksEls = document.querySelectorAll('#todoSubtasks .form-check-label');
    const currentSubtasks = Array.from(subtasksEls).map(el => el.textContent.trim()).join("\n");

    // Convert due date to yyyy-mm-dd
    let dueDateValue = "";
    if (currentDueDate && currentDueDate !== "-") {
        const parsed = new Date(currentDueDate);
        if (!isNaN(parsed)) dueDateValue = parsed.toISOString().split("T")[0];
    }

    // Build edit form
    const editFormHtml = `
        <form id="quickEditForm">
            <div class="mb-3">
                <label class="form-label">Title</label>
                <input type="text" class="form-control" id="editTitle" value="${currentTitle}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" id="editDescription" rows="3">${currentDescription.replace(/<\/?[^>]+(>|$)/g, "")}</textarea>
            </div>
            <div class="mb-3">
                <label class="form-label">Priority</label>
                <select class="form-select" id="editPriority">
                    <option value="low" ${currentPriority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${currentPriority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${currentPriority === 'high' ? 'selected' : ''}>High</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Due Date</label>
                <input type="date" class="form-control" id="taskDueDate" value="${dueDateValue}">
            </div>
            <div class="mb-3">
                <label class="form-label">Subtasks (one per line)</label>
                <textarea class="form-control" id="editSubtasks" rows="3">${currentSubtasks}</textarea>
            </div>
            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">Update</button>
                <button type="button" class="btn btn-secondary" onclick="cancelEdit()">Cancel</button>
            </div>
        </form>
    `;

    // Swap detail view with edit form
    const detailContainer = document.getElementById('todoDetail');
    const originalContent = detailContainer.innerHTML;
    detailContainer.innerHTML = `<h5>Edit Task</h5>${editFormHtml}`;
    window.originalDetailContent = originalContent;

    // Handle update submit
    document.getElementById('quickEditForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const updatedData = {
            todo_id: todoId,
            title: document.getElementById('editTitle').value,
            description: document.getElementById('editDescription').value,
            priority: document.getElementById('editPriority').value,
            due_date: document.getElementById('taskDueDate').value,
            subtasks: document.getElementById('editSubtasks').value
                .split("\n")
                .map(text => ({text: text.trim(), completed: false}))
                .filter(st => st.text.length > 0)
        };
        fetch('/update-task', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updatedData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Task updated successfully!');
                    window.location.reload();
                } else {
                    alert('Error: ' + data.error);
                }
            })
            .catch(err => {
                console.error('Error:', err);
                alert('Failed to update task');
            });
    });
}


// Restore detail view after cancel
function cancelEdit() {
    if (window.originalDetailContent) {
        document.getElementById('todoDetail').innerHTML = window.originalDetailContent;
        delete window.originalDetailContent;
    }
}
