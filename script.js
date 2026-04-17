const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');

// Load tasks from localStorage when page loads
document.addEventListener('DOMContentLoaded', loadTasks);

// Add task on button click
addBtn.addEventListener('click', addTask);

// Add task on Enter key
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    // Add to display
    createTaskElement(task);
    
    // Save to localStorage
    saveTasks();
    
    // Clear input
    taskInput.value = '';
    taskInput.focus();
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) li.classList.add('completed');
    li.dataset.id = task.id;

    li.innerHTML = `
        <input 
            type="checkbox" 
            class="task-checkbox" 
            ${task.completed ? 'checked' : ''}
        >
        <span class="task-text">${escapeHtml(task.text)}</span>
        <button class="delete-btn">Delete</button>
    `;

    // Checkbox toggle
    const checkbox = li.querySelector('.task-checkbox');
    checkbox.addEventListener('change', (e) => {
        li.classList.toggle('completed', e.target.checked);
        saveTasks();
    });

    // Delete button
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        li.remove();
        saveTasks();
    });

    taskList.appendChild(li);
}

function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.task-item').forEach(item => {
        tasks.push({
            id: item.dataset.id,
            text: item.querySelector('.task-text').textContent,
            completed: item.querySelector('.task-checkbox').checked
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => createTaskElement(task));
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
