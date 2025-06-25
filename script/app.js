import { auth, db } from '../config/firebase-config.js';
import {
  onAuthStateChanged,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  sendEmailVerification,
  deleteUser,
  GoogleAuthProvider,
  reauthenticateWithPopup,
  initializeAuth,
  browserPopupRedirectResolver,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  ref,
  push,
  set,
  get,
  remove
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
 apiKey: "AIzaSyDqTYRWnOALyjALg2Y5wSoCySoD9POoFjE",
    authDomain: "web-note-app-f928e.firebaseapp.com",
    projectId: "web-note-app-f928e",
    storageBucket: "web-note-app-f928e.firebasestorage.app",
    messagingSenderId: "639121324059",
    appId: "1:639121324059:web:cbfaf64e008fd94b60a0be",
    measurementId: "G-CFPSHZSRZ5"
};



// ✅ Add this immediately after the imports
// Priority: Firebase > localStorage > default
let userSettings = {
  weekStart: localStorage.getItem('weekStart') || 'Monday',
  emailReminders: localStorage.getItem('emailReminders') === 'true',
  defaultStatus: localStorage.getItem('defaultStatus') || 'Planned',
  defaultPriority: localStorage.getItem('defaultPriority') || 'Medium'
};



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

//settins popup 
const settingsPopup = document.getElementById('settingsPopup');
const settingsBtn = document.getElementById('settingsBtn');
const settingsCloseX = document.getElementById('settingsCloseX');
settingsBtn.addEventListener('click', () => settingsPopup.classList.remove('hidden'));
settingsCloseX.addEventListener('click', () => settingsPopup.classList.add('hidden'));

let selectedDay = null;
let editingTaskId = null;
let currentTaskData = null;
let weekOffset = 0;

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  const userNickname = document.getElementById('userNickname');
  
  if (user) {
    // If the user is logged in, display their display name or email if Google login was used
    userNickname.textContent = user.displayName || user.email;
  } else {
    // If no user is logged in, show 'Guest'
    userNickname.textContent = 'Guest';
  }
});

  // Settings dropdowns must exist in the DOM
  const weekStartEl = document.getElementById('weekStart');
  const defaultStatusEl = document.getElementById('defaultStatus');

  // Load persisted settings
  if (weekStartEl) {
    weekStartEl.value = userSettings.weekStart;
    weekStartEl.onchange = () => {
      userSettings.weekStart = weekStartEl.value;
      localStorage.setItem('weekStart', weekStartEl.value);
      renderWeek();
    };
  }

  if (defaultStatusEl) {
    defaultStatusEl.value = userSettings.defaultStatus;
    defaultStatusEl.onchange = () => {
      userSettings.defaultStatus = defaultStatusEl.value;
      localStorage.setItem('defaultStatus', defaultStatusEl.value);
    };
  }

  // Finally render week
  renderWeek();
});


//change status 
window.changeDefaultStatus = function () {
  const selected = document.getElementById('defaultStatus').value;
  userSettings.defaultStatus = selected;
  localStorage.setItem('defaultStatus', selected);
};

async function loadUserSettings() {
  const snapshot = await get(ref(db, `users/${uid()}/settings`));
  if (snapshot.exists()) {
  Object.assign(userSettings, snapshot.val());
  } 
}

// function getCurrentWeekDates(offset = 0) {
//   const start = new Date();
//   const day = start.getDay();
//   const diff = start.getDate() - day + (day === 0 ? -6 : 1);
//   const monday = new Date(start.setDate(diff + offset * 7));
//   return Array.from({ length: 7 }, (_, i) => {
//     const d = new Date(monday);
//     d.setDate(monday.getDate() + i);
//     return d;
//   });
// }

function getCurrentWeekDates(offset = 0) {
  const start = new Date();
  const day = start.getDay(); // 0 = Sunday, 1 = Monday...

  // Calculate week start based on setting
  const diff = 
  start.getDate() -
  day +
  (userSettings.weekStart === 'Sunday' ? 0 : (day === 0 ? -6 : 1));

  const weekStart = new Date(start.setDate(diff + offset * 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

window.changeWeekStart = function () {
  const selected = document.getElementById('weekStart').value;
  const normalized = selected.charAt(0).toUpperCase() + selected.slice(1).toLowerCase(); // Normalize casing
  userSettings.weekStart = normalized;
  localStorage.setItem('weekStart', normalized);
  renderWeek();
};


//updated render
function renderWeek() {
//updated 
if (!weekGrid || !weekLabel) {
  console.error('Missing #weekGrid or #weekLabel in DOM');
  return;
}
  const dates = getCurrentWeekDates(weekOffset);
  const weekNumber = getISOWeekNumber(dates[0]);
  weekLabel.textContent = `Week ${weekNumber} — ${dates[0].toDateString()} – ${dates[6].toDateString()}`;
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

window.addEventListener('DOMContentLoaded', () => {
  const filterSelect = document.getElementById('statusFilter');
  const weekStartEl = document.getElementById('weekStart');
  const defaultStatusEl = document.getElementById('defaultStatus');
  const importInput = document.getElementById('importInput');
  const uploadBtn = document.getElementById('uploadTasksBtn');

  if (defaultStatusEl && userSettings.defaultStatus) {
    defaultStatusEl.value = userSettings.defaultStatus;
  }
  
  // ✅ Use stored value directly, do NOT lowercase
  if (weekStartEl && userSettings.weekStart) {
    weekStartEl.value = userSettings.weekStart;
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      renderWeek();
    });
  }

  if (uploadBtn && importInput) {
    uploadBtn.addEventListener('click', async () => {
      const file = importInput.files?.[0];
      if (!file) {
        return alert('Please first select a JSON file using the input above.');
      }

      try {
        await importTasks(file);
        // Clear input so same file can be chosen again
        importInput.value = '';
      } catch (e) {
        console.error(e);
        alert('Upload failed: ' + e.message);
      }
    });
  }

//   document.getElementById('importInput')?.addEventListener('change', async evt => {
//   const file = evt.target.files[0];
//   if (!file) return;
//   await importTasks(file);
//   evt.target.value = ''; 
// });

  renderWeek(); // ✅ Ensure calendar is rendered based on current settings
});


//added fnction for redner 
function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

//jump to date
window.jumpToDate = () => {
  const input = document.getElementById('jumpDateInput');
  if (!input.value) return;
  const target = new Date(input.value);
  const today = new Date();
  const diffDays = Math.floor((target - today) / (1000 * 60 * 60 * 24));
  weekOffset = Math.floor(diffDays / 7);
  renderWeek();
};

window.changeWeek = direction => {
  weekOffset += direction;
  renderWeek();
};

//today jump function 
window.goToday = () => {
  weekOffset = 0;
  renderWeek();
};


window.openPopup = (date, task = null, id = null) => {
  selectedDay = date;
  editingTaskId = id;
  currentTaskData = task;
  taskPopup.classList.remove('hidden');

  taskTitle.value = task?.title || '';
  taskColor.value = task?.color || '#cccccc';
  taskStatus.value = task?.status || userSettings.defaultStatus;
  taskPriority.value = task?.priority || 'Low';
};

// window.openPopup = (date, task = null, id = null) => {
//   selectedDay = date;
//   editingTaskId = id;
//   currentTaskData = task;
//   taskPopup.classList.remove('hidden');
//   taskTitle.value = task?.title || '';
//   const color = task?.color || '#cccccc';
//   taskColor.value = color;
//   taskColor.style.backgroundColor = color;
//   taskStatus.value = task?.status || 'Planned';
//   taskPriority.value = task?.priority || 'Low';
//   taskStatus.value = task?.status || userSettings.defaultStatus;
// };

window.closePopup = () => {
  taskPopup.classList.add('hidden');
};

popupCloseX.addEventListener('click', () => closePopup());

//change email 
// import { sendEmailVerification, updateEmail } from "firebase/auth";

window.changeEmail = async function changeEmail() {
  const newEmail = document.getElementById("newEmailInput")?.value.trim();
  const user = auth.currentUser;

  // ✅ Check if user is logged in
  if (!user) {
    alert("No authenticated user found.");
    return;
  }

  if (!newEmail) {
    alert("Please enter a new email.");
    return;
  }

  // ✅ Check if current email is verified
  if (!user.emailVerified) {
    const confirm = window.confirm("Your email is not verified. Do you want to send a verification email?");
    if (confirm) {
      try {
        await sendEmailVerification(user);
        alert("Verification email sent. Please verify before changing your email.");
      } catch (err) {
        console.error("Verification error:", err);
        alert("Failed to send verification email.");
      }
    }
    return;
  }

  // ✅ Try changing email
  try {
    await updateEmail(user, newEmail);
    alert("Email updated successfully.");
  } catch (error) {
    console.error("Failed to change email:", error);
    alert("Failed to change email: " + error.message);
  }
};


//account delete
window.deleteAccount = async function() {
  const user = auth.currentUser;
  if (!user) return alert("Not logged in.");

  try {
    const providerId = user.providerData[0]?.providerId;
    if (providerId === 'google.com') {
      await reauthenticateWithPopup(user, new GoogleAuthProvider());
    } else {
      const pwd = document.getElementById('confirmPassword')?.value;
      if (!pwd) return alert("Enter password.");
      const cred = EmailAuthProvider.credential(user.email, pwd);
      await reauthenticateWithCredential(user, cred);
    }

    await remove(ref(db, `users/${user.uid}/tasks`));
    await deleteUser(user);
    alert("Account and tasks deleted.");
    window.location.href = 'login.html';
  } catch (e) {
    console.error(e);
    alert(e.code === 'auth/requires-recent-login'
      ? 'Re-auth required.'
      : e.message);
  }
};

// window.deleteAccount = async function deleteAccount() {
//   const user = auth.currentUser;
//   if (!user) return alert("Not logged in.");

//   try {
//     const providerId = user.providerData[0]?.providerId;

//     if (providerId === 'google.com') {
//       const provider = new GoogleAuthProvider();
//       await reauthenticateWithPopup(auth, provider);
//     } else {
//       const pwd = document.getElementById('confirmPassword')?.value.trim();
//       if (!pwd) return alert("Enter your password to confirm deletion.");
//       const credential = EmailAuthProvider.credential(user.email, pwd);
//       await reauthenticateWithCredential(auth, credential);
//     }

//     await remove(ref(db, `users/${user.uid}/tasks`));
//     await deleteUser(user);
//     alert("Account and all tasks deleted.");
//     window.location.href = 'login.html';

//   } catch (error) {
//     console.error(error);
//     const code = error.code;
//     if (code === 'auth/popup-closed-by-user') {
//       return alert("Popup closed — account was not deleted.");
//     } else if (code === 'auth/requires-recent-login') {
//       return alert("Please sign in again before trying to delete your account.");
//     }
//     alert(error.message);
//   }
// };



//verify current email 
async function verifyCurrentUserEmail() {
  const user = auth.currentUser;
  const password = prompt("Please re-enter your password:");

  if (!user || !user.email || !password) {
    alert("Missing credentials.");
    return;
  }

  const credential = EmailAuthProvider.credential(user.email, password);

  try {
    await reauthenticateWithCredential(user, credential);
    await sendEmailVerification(user);
    alert("Verification email sent.");
  } catch (error) {
    console.error("Verification error:", error);
    alert("Failed to send verification email: " + error.message);
  }
}

//new function export, save preferences, load user preferences
// SETTINGS FUNCTIONS

// Export all tasks as JSON
window.exportAllTasks = async () => {
  const uidValue = auth.currentUser?.uid;
  if (!uidValue) return alert("User not logged in.");
  const snapshot = await get(ref(db, `users/${uidValue}/tasks`));
  if (!snapshot.exists()) return alert("No tasks to export.");

  const tasks = snapshot.val();
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `tasks_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
};

// Save settings (e.g., email reminders, default task status/priority)
window.saveUserPreferences = async () => {
  const uidValue = auth.currentUser?.uid;
  if (!uidValue) return alert("User not logged in.");

  const emailReminders = document.getElementById('emailReminders')?.checked;
  const defaultStatus = document.getElementById('defaultStatus')?.value;
  const defaultPriority = document.getElementById('defaultPriority')?.value;
  const weekStart = document.getElementById('weekStart')?.value;

  const prefs = {
    emailReminders,
    defaultStatus,
    defaultPriority,
    weekStart
  };

  await set(ref(db, `users/${uidValue}/preferences`), prefs);
  alert("Settings saved successfully.");
};

// Load preferences into the settings popup
window.loadUserPreferences = async () => {
  const uidValue = auth.currentUser?.uid;
  if (!uidValue) return;
  const snapshot = await get(ref(db, `users/${uidValue}/preferences`));
  if (!snapshot.exists()) return;
  const prefs = snapshot.val();

  if (document.getElementById('emailReminders')) {
    document.getElementById('emailReminders').checked = prefs.emailReminders || false;
  }
  if (prefs.defaultStatus && document.getElementById('defaultStatus')) {
    document.getElementById('defaultStatus').value = prefs.defaultStatus;
  }
  if (prefs.defaultPriority && document.getElementById('defaultPriority')) {
    document.getElementById('defaultPriority').value = prefs.defaultPriority;
  }
  if (prefs.weekStart && document.getElementById('weekStart')) {
    document.getElementById('weekStart').value = prefs.weekStart;
  }
};

// Call loadUserPreferences on popup open if needed
// loadUserPreferences(); // you can call this inside the function that shows the settings popup
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
  
  const filterEl = document.getElementById('statusFilter');
  const statusFilter = filterEl ? filterEl.value : '';

  get(ref(db, `users/${uid()}/tasks/${date}`)).then(snapshot => {
    const container = document.getElementById(`tasks-${date}`);
    if (!container) return console.error('Missing task list container:', `tasks-${date}`);

    container.innerHTML = '';
    if (snapshot.exists()) {
      Object.entries(snapshot.val()).forEach(([id, data]) => {
        if (statusFilter && data.status !== statusFilter) return;
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

//import tasks from JSON
window.importTasks = async function(file) {
  try {
    const content = await file.text();
    const tasksByDate = JSON.parse(content);
    const uidValue = auth.currentUser?.uid;
    if (!uidValue) throw new Error('Not logged in.');

    const existingSnapshot = await get(ref(db, `users/${uidValue}/tasks`));
    const existingData = existingSnapshot.exists() ? existingSnapshot.val() : {};
    let count = 0, skipped = 0;

    for (const [date, tasks] of Object.entries(tasksByDate)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      const existingForDay = existingData[date] || {};

      for (const task of Object.values(tasks)) {
        const exists = Object.values(existingForDay).some(t =>
          t.title === task.title &&
          t.createdAt === task.createdAt
        );
        if (exists) {
          skipped++;
          continue;
        }
        const id = push(ref(db, `users/${uidValue}/tasks/${date}`)).key;
        await set(ref(db, `users/${uidValue}/tasks/${date}/${id}`), task);
        count++;
      }
    }

    alert(`Imported ${count} new tasks. Skipped ${skipped} duplicates.`);
    renderWeek();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};


async function importTasks(file) {
  try {
    const fileContent = await file.text();
    const tasksByDate = JSON.parse(fileContent);
    const uidValue = auth.currentUser?.uid;
    if (!uidValue) throw new Error('Not logged in.');

    const existingSnapshot = await get(ref(db, `users/${uidValue}/tasks`));
    const existingData = existingSnapshot.exists() ? existingSnapshot.val() : {};

    let count = 0, skipped = 0;

    for (const [date, tasks] of Object.entries(tasksByDate)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      const existingForDay = existingData[date] || {};

      for (const task of Object.values(tasks)) {
        const exists = Object.values(existingForDay).some(t =>
          t.title === task.title &&
          t.createdAt === task.createdAt
        );
        if (exists) {
          skipped++;
          continue;  // skip duplicates
        }
        const id = push(ref(db, `users/${uidValue}/tasks/${date}`)).key;
        await set(ref(db, `users/${uidValue}/tasks/${date}/${id}`), task);
        count++;
      }
    }

    alert(`Imported ${count} new tasks, skipped ${skipped} duplicates.`);
    renderWeek();

  } catch (err) {
    console.error(err);
    alert('Import failed: ' + err.message);
  }
}

function onDrop(e, toDate) {
  const { id, from } = JSON.parse(e.dataTransfer.getData('text/plain'));
  get(ref(db, `users/${uid()}/tasks/${from}/${id}`)).then(snapshot => {
    const data = snapshot.val();

    // Do NOT change updatedAt or createdAt
    remove(ref(db, `users/${uid()}/tasks/${from}/${id}`));
    set(ref(db, `users/${uid()}/tasks/${toDate}/${id}`), data).then(() => renderWeek());
  });
}


window.logout = () => {
  signOut(auth).then(() => window.location.href = 'login.html');
};