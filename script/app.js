import { auth, db } from '../config/firebase-config.js';
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  ref,
  push,
  set,
  get,
  remove
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const uid = () => auth.currentUser?.uid;
const weekGrid = document.getElementById('weekGrid');
const weekLabel = document.getElementById('weekLabel');
const taskPopup = document.getElementById('taskPopup');
const taskTitle = document.getElementById('taskTitle');
const taskColor = document.getElementById('taskColor');
const taskStatus = document.getElementById('taskStatus');
const taskPriority = document.getElementById('taskPriority');

const calendarBtn = document.getElementById('calendarBtn');
const googleCalendarBtn = document.getElementById('googleCalendarBtn');
const emailBtn = document.getElementById('emailBtn');
const downloadBtn = document.getElementById('downloadBtn');
const deleteBtn = document.getElementById('deleteBtn');
const popupCloseX = document.getElementById('popupCloseX');

let selectedDay = null;
let editingTaskId = null;
let currentTaskData = null;
let weekOffset = 0;

onAuthStateChanged(auth, user => {
  if (!user) window.location.href = 'login.html';
  else renderWeek();
});

function getCurrentWeekDates(offset = 0) {
  const start = new Date();
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(start.setDate(diff + offset * 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function renderWeek() {
  const dates = getCurrentWeekDates(weekOffset);
  weekLabel.textContent = dates[0].toDateString() + ' – ' + dates[6].toDateString();
  weekGrid.innerHTML = '';

  dates.forEach(date => {
    const key = date.toISOString().split('T')[0];
    const col = document.createElement('div');
    col.className = 'day-column';
    col.dataset.date = key;
    col.innerHTML = `
      <div class="day-header" style="color: black;">${date.toDateString().split(' ').slice(0, 3).join(' ')}</div>
      <button class="add-btn" onclick="openPopup('${key}')" title="Add Task">➕</button>
      <div class="task-list" id="tasks-${key}"></div>
    `;
    col.addEventListener('dragover', e => e.preventDefault());
    col.addEventListener('drop', e => onDrop(e, key));
    weekGrid.appendChild(col);
    loadTasks(key);
  });
}

window.changeWeek = direction => {
  weekOffset += direction;
  renderWeek();
};

window.openPopup = (date, task = null, id = null) => {
  selectedDay = date;
  editingTaskId = id;
  currentTaskData = task;
  taskPopup.classList.remove('hidden');
  taskTitle.value = task?.title || '';
  const color = task?.color || '#cccccc';
  taskColor.value = color;
  taskColor.style.backgroundColor = color;
  taskStatus.value = task?.status || 'Planned';
  taskPriority.value = task?.priority || 'Low';
};

window.closePopup = () => {
  taskPopup.classList.add('hidden');
};

popupCloseX.addEventListener('click', () => closePopup());

window.saveTask = () => {
  if (!taskTitle.value.trim()) {
    alert("Task title cannot be empty.");
    return;
  }
  const now = new Date().toISOString();
  const data = {
    title: taskTitle.value,
    color: taskColor.value,
    status: taskStatus.value,
    priority: taskPriority.value,
    updatedAt: now
  };
  const path = `users/${uid()}/tasks/${selectedDay}`;
  const taskId = editingTaskId || push(ref(db, path)).key;
  set(ref(db, `${path}/${taskId}`), data).then(() => {
    closePopup();
    renderWeek();
  });
};

window.deleteTask = () => {
  if (!editingTaskId) return;
  const path = `users/${uid()}/tasks/${selectedDay}/${editingTaskId}`;
  remove(ref(db, path)).then(() => {
    closePopup();
    renderWeek();
  });
};

function loadTasks(date) {
  get(ref(db, `users/${uid()}/tasks/${date}`)).then(snapshot => {
    const container = document.getElementById(`tasks-${date}`);
    container.innerHTML = '';
    if (snapshot.exists()) {
      const tasks = snapshot.val();
      Object.entries(tasks).forEach(([id, data]) => {
        const div = document.createElement('div');
        div.className = 'task-item';
        div.style.borderLeftColor = data.color;

        const priorityColor = data.priority === 'High' ? 'red' : data.priority === 'Medium' ? 'orange' : 'green';
        const statusColor = data.status === 'Done' ? 'green' : data.status === 'In Progress' ? 'blue' : 'gray';

        div.innerHTML = `
          <strong>${data.title}</strong><br>
          <div style="display: flex; gap: 5px; margin: 5px 0;">
            <span style="background: ${statusColor}; color: white; padding: 2px 6px; border-radius: 6px; font-size: 0.75rem;">${data.status || '-'}</span>
            <span style="background: ${priorityColor}; color: white; padding: 2px 6px; border-radius: 6px; font-size: 0.75rem;">${data.priority || '-'}</span>
          </div>
          <small>${new Date(data.updatedAt).toLocaleString()}</small>
        `;

        div.draggable = true;
        div.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text/plain', JSON.stringify({ id, from: date }));
        });
        div.addEventListener('click', () => openPopup(date, data, id));
        container.appendChild(div);
      });
    }
  });
}

function validateCurrentTask() {
  return currentTaskData && currentTaskData.title?.trim();
}

window.exportToCalendar = () => {
  if (!validateCurrentTask()) return alert("No valid task to export.");
  const title = encodeURIComponent(currentTaskData.title);
  const details = encodeURIComponent(`Priority: ${currentTaskData.priority}, Status: ${currentTaskData.status}`);
  const blob = new Blob([`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title}\nDESCRIPTION:${details}\nEND:VEVENT\nEND:VCALENDAR`], { type: 'text/calendar' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${title}.ics`;
  a.click();
};

window.exportToGoogleCalendar = () => {
  if (!validateCurrentTask()) return alert("No valid task to export.");
  const title = encodeURIComponent(currentTaskData.title);
  const details = encodeURIComponent(`Priority: ${currentTaskData.priority}, Status: ${currentTaskData.status}`);
  const url = `https://calendar.google.com/calendar/r/eventedit?text=${title}&details=${details}`;
  window.open(url, '_blank');
};

window.exportToEmail = () => {
  if (!validateCurrentTask()) return alert("No valid task to email.");
  const subject = encodeURIComponent(`Task: ${currentTaskData.title}`);
  const body = encodeURIComponent(`Task: ${currentTaskData.title}\nPriority: ${currentTaskData.priority}\nStatus: ${currentTaskData.status}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

window.exportToJson = () => {
  if (!validateCurrentTask()) return alert("No valid task to download.");
  const blob = new Blob([JSON.stringify(currentTaskData, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${currentTaskData.title.replace(/\s+/g, '_')}.json`;
  a.click();
};

function onDrop(e, toDate) {
  const { id, from } = JSON.parse(e.dataTransfer.getData('text/plain'));
  get(ref(db, `users/${uid()}/tasks/${from}/${id}`)).then(snapshot => {
    const data = snapshot.val();
    data.updatedAt = new Date().toISOString();
    remove(ref(db, `users/${uid()}/tasks/${from}/${id}`));
    set(ref(db, `users/${uid()}/tasks/${toDate}/${id}`), data).then(() => renderWeek());
  });
}

window.logout = () => {
  signOut(auth).then(() => window.location.href = 'login.html');
};
