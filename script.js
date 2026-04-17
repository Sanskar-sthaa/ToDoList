const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('categorySelect');
const dueDateInput = document.getElementById('dueDateInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sortSelect');
const categoryFiltersContainer = document.getElementById('categoryFilters');

let currentFilter = 'all';
let currentCategoryFilter = null;
let currentSort = 'date-added';
let allTasks = [];

const CATEGORIES = ['General', 'Work', 'Personal', 'Shopping', 'Health'];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    initializeCategoryFilters();
    renderTasks();
});

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderTasks();
    });
});

sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTasks();
});

function initializeCategoryFilters() {
    CATEGORIES.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-filter-btn';
        btn.textContent = category;
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            currentCategoryFilter = btn.classList.contains('active') ? category : null;
            renderTasks();
        });
        categoryFiltersContainer.appendChild(btn);
    });
}

function addTask() {
    const taskText = taskInput.value.trim();
    const category = categorySelect.value;
    const dueDate = dueDateInput.value;

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        category: category,
        dueDate: dueDate,
        completed: false,
        dateAdded: new Date().toISOString()
    };

    allTasks.push(task);
    saveTasks();
    renderTasks();

    taskInput.value = '';
    categorySelect.value = 'General';
    dueDateInput.value = '';
    taskInput.focus();
}

function getFilteredAndSortedTasks() {
    let filtered = allTasks.filter(task => {
        // Status filter
        if (currentFilter === 'active' && task.completed) return false;
        if (currentFilter === 'completed' && !task.completed) return false;

        // Category filter
        if (currentCategoryFilter && task.category !== currentCategoryFilter) return false;

        return true;
    });

    // Sort
    filtered.sort((a, b) => {
        if (currentSort === 'date-added') {
            return new Date(b.dateAdded) - new Date(a.dateAdded);
        } else if (currentSort === 'due-date') {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (currentSort === 'category') {
            return a.category.localeCompare(b.category);
        }
    });

    return filtered;
}

function renderTasks() {
    taskList.innerHTML = '';
    const filteredTasks = getFilteredAndSortedTasks();

    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        if (task.completed) li.classList.add('completed');
        li.dataset.id = task.id;

        const categoryColor = getCategoryColor(task.category);
        const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0);
        const dueDateDisplay = task.dueDate ? formatDate(task.dueDate) : '';

        li.innerHTML = `
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
            >
            <div class="task-content">
                <div class="task-header">
                    <span class="task-text">${escapeHtml(task.text)}</span>
                    <span class="task-category" style="background-color: ${categoryColor};">${task.category}</span>
                </div>
                <div class="task-meta">
                    ${task.dueDate ? `<div class="task-due-date ${isOverdue ? 'overdue' : ''}">📅 ${dueDateDisplay}${isOverdue ? ' (Overdue)' : ''}</div>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="delete-btn">Delete</button>
            </div>
        `;

        const checkbox = li.querySelector('.task-checkbox');
        checkbox.addEventListener('change', (e) => {
            const taskIndex = allTasks.findIndex(t => t.id == task.id);
            allTasks[taskIndex].completed = e.target.checked;
            saveTasks();
            renderTasks();
        });

        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            allTasks = allTasks.filter(t => t.id != task.id);
            saveTasks();
            renderTasks();
        });

        taskList.appendChild(li);
    });
}

function getCategoryColor(category) {
    const colors = {
        'General': '#95a5a6',
        'Work': '#3498db',
        'Personal': '#e74c3c',
        'Shopping': '#f39c12',
        'Health': '#27ae60'
    };
    return colors[category] || '#95a5a6';
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(allTasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    allTasks = tasks;
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
