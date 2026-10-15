
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const remainingText = document.getElementById("remainingText");

const clearCompletedBtn = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter");

const STORAGE_KEY = "myTodoTasks";

let tasks = [];

try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];

    if (Array.isArray(parsedTasks)) {
        tasks = parsedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        );
    }
} catch (error) {
    tasks = [];
}

let currentFilter = "all";

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        alert("Unable to save tasks. Please check your browser storage.");
    }
}

function addTask() {
    const text = taskInput.value.trim();

    if (text === "") {
        alert("Please enter a task!");
        taskInput.focus();
        return;
    }

    const task = {
        id: crypto.randomUUID(),
        text: text,
        completed: false
    };

    tasks.unshift(task);
    saveTasks();

    taskInput.value = "";
    taskInput.focus();

    renderTasks();
}

function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, completed: !task.completed }
            : task
    );

    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    renderTasks();
}

function renderTasks() {
    taskList.replaceChildren();

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task as completed");
        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        const span = document.createElement("span");
        span.className = "task-text";
        span.textContent = task.text;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.setAttribute("aria-label", "Delete " + task.text);
        deleteBtn.addEventListener("click", () => {
            deleteTask(task.id);
        });

        li.append(checkbox, span, deleteBtn);
        taskList.appendChild(li);
    });

    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    totalCount.textContent = tasks.length;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;

    remainingText.textContent =
        `${pending} task${pending !== 1 ? "s" : ""} remaining`;

    emptyMessage.hidden = filteredTasks.length !== 0;

    if (tasks.length === 0) {
        emptyMessage.textContent = "No tasks yet. Add your first task!";
    } else if (filteredTasks.length === 0) {
        emptyMessage.textContent =
            currentFilter === "pending"
                ? "Great! No pending tasks."
                : "No completed tasks yet.";
    }
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        addTask();
    }
});

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(btn => {
            const isActive = btn === button;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-pressed", String(isActive));
        });

        renderTasks();
    });
});

clearCompletedBtn.addEventListener("click", clearCompleted);

renderTasks();
