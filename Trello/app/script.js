const modal = document.querySelector(".confirm-modal");
const columnsContainer = document.querySelector(".columns");
const columns = columnsContainer.querySelectorAll(".column");

let currentTask = null;

// funciones

const handleDragover = (event) => {
  event.preventDefault(); // permitir soltar

  const draggedTask = document.querySelector(".dragging");
  const target = event.target.closest(".task, .tasks");

  if (!target || target === draggedTask) return;

  if (target.classList.contains("tasks")) {
    // target es la tarea
    const lastTask = target.lastElementChild;
    if (!lastTask) {
      // tarea vacia
      target.appendChild(draggedTask);
    } else {
      const { bottom } = lastTask.getBoundingClientRect();
      event.clientY > bottom && target.appendChild(draggedTask);
    }
  } else {
    // target es otro
    const { top, height } = target.getBoundingClientRect();
    const distance = top + height / 2;

    if (event.clientY < distance) {
      target.before(draggedTask);
    } else {
      target.after(draggedTask);
    }
  }
};

const handleDrop = (event) => {
  event.preventDefault();
};

const handleDragend = (event) => {
  event.target.classList.remove("dragging");
};

const handleDragstart = (event) => {
  event.dataTransfer.effectsAllowed = "move";
  event.dataTransfer.setData("text/plain", "");
  requestAnimationFrame(() => event.target.classList.add("dragging"));
};

const handleDelete = (event) => {
  currentTask = event.target.closest(".task");

  // preview
  modal.querySelector(".preview").innerText = currentTask.innerText.substring(
    0,
    100
  );

  modal.showModal();
};

const handleEdit = (event) => {
  const task = event.target.closest(".task");
  const input = createTaskInput(task.innerText);
  task.replaceWith(input);
  input.focus();

  // mover cursor al final
  const selection = window.getSelection();
  selection.selectAllChildren(input);
  selection.collapseToEnd();
};

const handleBlur = (event) => {
  const input = event.target;
  const content = input.innerText.trim() || "Untitled";
  const task = createTask(content.replace(/\n/g, "<br>"));
  input.replaceWith(task);
};

const handleAdd = (event) => {
  const tasksEl = event.target.closest(".column").lastElementChild;
  const input = createTaskInput();
  tasksEl.appendChild(input);
  input.focus();
};

const updateTaskCount = (column) => {
  const tasks = column.querySelector(".tasks").children;
  const taskCount = tasks.length;
  column.querySelector(".column-title h3").dataset.tasks = taskCount;
};

const observeTaskChanges = () => {
  for (const column of columns) {
    const observer = new MutationObserver(() => updateTaskCount(column));
    observer.observe(column.querySelector(".tasks"), { childList: true });
  }
};

observeTaskChanges();

const createTask = (content) => {
  const task = document.createElement("div");
  task.className = "task";
  task.draggable = true;
  task.innerHTML = `
  <div>${content}</div>
  <menu>
      <button data-edit><i class="bi bi-pencil-square"></i></button>
      <button data-delete><i class="bi bi-trash"></i></button>
  </menu>`;
  task.addEventListener("dragstart", handleDragstart);
  task.addEventListener("dragend", handleDragend);
  return task;
};

const createTaskInput = (text = "") => {
  const input = document.createElement("div");
  input.className = "task-input";
  input.dataset.placeholder = "Task name";
  input.contentEditable = true;
  input.innerText = text;
  input.addEventListener("blur", handleBlur);
  return input;
};

// event listeners

// agarrar y soltar
tasksElements = columnsContainer.querySelectorAll(".tasks");
for (const tasksEl of tasksElements) {
  tasksEl.addEventListener("dragover", handleDragover);
  tasksEl.addEventListener("drop", handleDrop);
}

// agregar, editar y eliminar task
columnsContainer.addEventListener("click", (event) => {
  if (event.target.closest("button[data-add]")) {
    handleAdd(event);
  } else if (event.target.closest("button[data-edit]")) {
    handleEdit(event);
  } else if (event.target.closest("button[data-delete]")) {
    handleDelete(event);
  }
});

// confirmar eliminar
modal.addEventListener("submit", () => currentTask && currentTask.remove());

// cancelar eliminar
modal.querySelector("#cancel").addEventListener("click", () => modal.close());

// cerrar tarea seleccionada
modal.addEventListener("close", () => (currentTask = null));

// tareas default

let tasks = [
  // para empezar
  [
    "Escribir un libro 🖍️",
    "Crear un nuevo logo 🎨",
    "Reunión con el Equipo 📅",
  ],
  // en progreso
  [
    "Proyecto Diamond Shard 💎",
    "Corregir bugs de Website 🛠️",
    "Preguntarle a Sebas como hablar con mujeres (si es que sabe) 💬",
    "Conseguirle novia a Ronald (rápido) 😥",
  ],
  // pendiente
  [
    
    "Lanzar Website 🚀",
    "Fortnite con los pibes 🎮",
    "Visitar lugares nuevos 🏞️",
  ],
  // terminado
  [
    "Optimizar el código 💻",
    "Invertir en Dogecoin 💰",
  ],
];

tasks.forEach((col, idx) => {
  for (const item of col) {
    columns[idx].querySelector(".tasks").appendChild(createTask(item));
  }
});
