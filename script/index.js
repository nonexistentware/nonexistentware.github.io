// Initialize Firebase (compat API)
const firebaseConfig = {
  apiKey: "AIzaSyDqTYRWnOALyjALg2Y5wSoCySoD9POoFjE",
  authDomain: "web-note-app-f928e.firebaseapp.com",
  databaseURL: "https://web-note-app-f928e-default-rtdb.firebaseio.com",
  projectId: "web-note-app-f928e",
  storageBucket: "web-note-app-f928e.appspot.com",
  messagingSenderId: "639121324059",
  appId: "1:639121324059:web:cbfaf64e008fd94b60a0be"
};

if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
} else {
  console.error('Firebase SDK not loaded');
}

const auth = firebase.auth();
const db = firebase.database();
let currentUser = null;

// Services configuration
const services = [
  { title: "Cloud tasks", img: "/img/cloudtask.png", desc: "Create tasks and save them in the cloud.", url: "services/login.html" },
  { title: "Csv generator", img: "/img/csv.png", desc: "Generate CSV files.", url: "services/filegenerator.html" },
  { title: "API online", img: "/img/api.png", desc: "Online API tester.", url: "services/apitester.html" },
  { title: "Converter", img: "/img/converter.png", desc: "Convert formats.", url: "services/converter.html" },
  { title: "File with weight", img: "/img/weight.png", desc: "Create files with custom size.", url: "services/weightgenerator.html" },
  { title: "Temp email", img: "/img/letter.png", desc: "Temporary email.", url: "services/email.html" },
  { title: "Proxy list", img: "/img/proxyimg.png", desc: "Proxy servers list.", url: "services/proxylist.html" },
  { title: "What's new", img: "/img/appnews.png", desc: "Latest updates.", url: "services/newspage.html" },
  { title: "Online game: CV, please", img: "/img/cvplease1.png", desc: "You need to find candidate that fits.", url: "https://www.cvplease.online", target: "_blank" }
];

// Utility functions
function normalizeUrl(url) {
  if (/^https?:\/\//i.test(url)) return url;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(url)) return 'https://' + url;
  return window.location.origin + (url.startsWith('/') ? url : '/' + url);
}

function updateDefaultAvatar() {
  const avatarEl = document.getElementById('userAvatar');
  if (avatarEl && avatarEl.classList.contains('default-icon')) {
    const currentTheme = document.body.dataset.theme;
    avatarEl.src = currentTheme === 'dark' ? './img/user_light.png' : './img/user.png';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Authentication handlers
auth.onAuthStateChanged(user => {
  currentUser = user;

  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const greetingEl = document.getElementById('userGreeting');
  const nameEl = document.getElementById('userName');
  const avatarEl = document.getElementById('userAvatar');

  if (loginBtn) loginBtn.style.display = user ? 'none' : 'inline-block';
  if (logoutBtn) logoutBtn.style.display = user ? 'inline-block' : 'none';

  if (greetingEl) {
    greetingEl.classList.remove('hidden');
    greetingEl.style.display = 'flex';
  }

  if (user) {
    const displayName = user.displayName || user.email || 'User';
    if (nameEl) nameEl.textContent = `Hi, ${escapeHtml(displayName)}`;

    if (avatarEl) {
      if (user.photoURL) {
        avatarEl.src = user.photoURL;
        avatarEl.classList.remove('default-icon');
      } else {
        avatarEl.src = './img/user.png';
        avatarEl.classList.add('default-icon');
      }
    }
  } else {
    if (nameEl) nameEl.textContent = 'Hi, User';
    if (avatarEl) {
      avatarEl.src = './img/user.png';
      avatarEl.classList.add('default-icon');
    }
  }

  renderAll();
  updateDefaultAvatar();
});

// Initialize button handlers
function initButtons() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loginBtn) {
    loginBtn.onclick = () => {
      const modal = document.getElementById('loginModal');
      if (modal) {
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
      }
    };
  }

  if (logoutBtn) {
    logoutBtn.onclick = () => {
      auth.signOut()
        .then(() => toast.success('Logged out successfully'))
        .catch(err => {
          console.error('Logout error:', err);
          toast.error('Failed to logout: ' + err.message);
        });
    };
  }
}

// Render functions
function renderAll() {
  const container = document.getElementById('serviceContainer');
  if (!container) return;

  container.innerHTML = '';

  services.forEach(item => {
    const card = createServiceCard(item);
    container.appendChild(card);
  });

  if (currentUser) {
    loading.show();
    db.ref('users/' + currentUser.uid + '/shortcuts').once('value')
      .then(snapshot => {
        const data = snapshot.val() || {};
        Object.entries(data).forEach(([key, item]) => {
          const card = createCustomCard(item, key);
          container.appendChild(card);
        });
        container.appendChild(createAddCard());
        loading.hide();
      })
      .catch(err => {
        console.error('Error loading shortcuts:', err);
        toast.error('Failed to load shortcuts');
        loading.hide();
        container.appendChild(createAddCard());
      });
  } else {
    container.appendChild(createAddCard());
  }
}

function createServiceCard(item) {
  const card = document.createElement('div');
  card.className = 'service-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${item.title}: ${item.desc}`);

  const url = item.url || item.href || '#';
  const target = item.target || '_self';

  const handleClick = () => {
    if (target === '_blank' || item.target === '_blank') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  };

  card.onclick = handleClick;
  card.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  card.innerHTML = `
    <div class="service-title">${escapeHtml(item.title)}</div>
    <img class="service-image" src="${escapeHtml(item.img)}" alt="${escapeHtml(item.title)}" loading="lazy">
    <div class="service-description">${escapeHtml(item.desc)}</div>
  `;

  return card;
}

function createCustomCard(item, key) {
  const card = document.createElement('div');
  card.className = 'service-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${item.title}: ${item.desc}`);

  const handleClick = (e) => {
    if (!e.target.closest('.menu-btn') && !e.target.closest('.context-menu')) {
      window.open(normalizeUrl(item.url), '_blank', 'noopener,noreferrer');
    }
  };

  card.onclick = handleClick;
  card.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  card.innerHTML = `
    <div class="service-title">${escapeHtml(item.title)}</div>
    <img class="service-image" src="${escapeHtml(item.img || '/img/default.png')}" alt="${escapeHtml(item.title)}" loading="lazy">
    <div class="service-description">${escapeHtml(item.desc || '')}</div>
  `;

  const menuBtn = document.createElement('button');
  menuBtn.className = 'menu-btn';
  menuBtn.setAttribute('aria-label', 'Options menu');
  menuBtn.setAttribute('aria-haspopup', 'true');
  menuBtn.innerHTML = '⋮';
  menuBtn.onclick = (ev) => {
    ev.stopPropagation();
    document.querySelectorAll('.context-menu').forEach(m => m.classList.remove('show'));
    menu.classList.toggle('show');
  };

  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = `
    <button role="menuitem" onclick="startEdit('${key}','${escapeHtml(item.title).replace(/'/g, "\\'")}','${escapeHtml(item.desc || '').replace(/'/g, "\\'")}','${escapeHtml(item.url).replace(/'/g, "\\'")}','${escapeHtml(item.img || '').replace(/'/g, "\\'")}')">Edit</button>
    <button role="menuitem" onclick="deleteShortcut('${key}')">Delete</button>
  `;

  card.appendChild(menuBtn);
  card.appendChild(menu);
  return card;
}

function createAddCard() {
  const addCard = document.createElement('div');
  addCard.className = 'service-card';
  addCard.setAttribute('role', 'button');
  addCard.setAttribute('tabindex', '0');
  addCard.setAttribute('aria-label', 'Add new shortcut');

  const handleClick = () => {
    if (currentUser) {
      const modal = document.getElementById('addModal');
      if (modal) {
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
      }
    } else {
      const modal = document.getElementById('loginModal');
      if (modal) {
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
      }
    }
  };

  addCard.onclick = handleClick;
  addCard.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  if (currentUser) {
    addCard.innerHTML = '<div class="add-card">+</div>';
  } else {
    addCard.innerHTML = `
      <div class="add-card">+</div>
      <div style="font-size:14px; margin-top:10px; text-align:center;">
        Login or create account to add shortcut
      </div>
    `;
  }

  return addCard;
}

// Modal functions
window.closeModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    // Clear form inputs
    if (id === 'addModal') {
      const titleInput = document.getElementById('newTitle');
      const descInput = document.getElementById('newDesc');
      const urlInput = document.getElementById('newUrl');
      const imgLinkInput = document.getElementById('newImgLink');
      const imgFileInput = document.getElementById('newImgFile');
      if (titleInput) titleInput.value = '';
      if (descInput) descInput.value = '';
      if (urlInput) urlInput.value = '';
      if (imgLinkInput) imgLinkInput.value = '';
      if (imgFileInput) imgFileInput.value = '';
    } else if (id === 'editModal') {
      const titleInput = document.getElementById('editTitle');
      const descInput = document.getElementById('editDesc');
      const urlInput = document.getElementById('editUrl');
      const imgLinkInput = document.getElementById('editImgLink');
      const imgFileInput = document.getElementById('editImgFile');
      if (titleInput) titleInput.value = '';
      if (descInput) descInput.value = '';
      if (urlInput) urlInput.value = '';
      if (imgLinkInput) imgLinkInput.value = '';
      if (imgFileInput) imgFileInput.value = '';
    } else if (id === 'loginModal') {
      const emailInput = document.getElementById('emailInput');
      const passwordInput = document.getElementById('passwordInput');
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';
    }
  }
};

// Close modals on outside click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('show');
    e.target.setAttribute('aria-hidden', 'true');
  }
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.show').forEach(modal => {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('.context-menu.show').forEach(menu => {
      menu.classList.remove('show');
    });
  }
});

// Shortcut functions
window.saveShortcut = function() {
  if (!currentUser) {
    toast.error('Please login to add shortcuts');
    return;
  }

  const title = document.getElementById('newTitle').value.trim();
  const desc = document.getElementById('newDesc').value.trim();
  const url = document.getElementById('newUrl').value.trim();
  const imgLink = document.getElementById('newImgLink').value.trim() || '/img/default.png';
  const file = document.getElementById('newImgFile').files[0];

  if (!title || !url) {
    toast.warning('Title and URL are required');
    return;
  }

  loading.show();

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      resizeImage(e.target.result, 256, 256, (resized) => {
        db.ref('users/' + currentUser.uid + '/shortcuts').push({ title, desc, url, img: resized })
          .then(() => {
            closeModal('addModal');
            renderAll();
            toast.success('Shortcut added successfully');
            loading.hide();
          })
          .catch(err => {
            console.error('Error saving shortcut:', err);
            toast.error('Failed to save shortcut');
            loading.hide();
          });
      });
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
      loading.hide();
    };
    reader.readAsDataURL(file);
  } else {
    db.ref('users/' + currentUser.uid + '/shortcuts').push({ title, desc, url, img: imgLink })
      .then(() => {
        closeModal('addModal');
        renderAll();
        toast.success('Shortcut added successfully');
        loading.hide();
      })
      .catch(err => {
        console.error('Error saving shortcut:', err);
        toast.error('Failed to save shortcut');
        loading.hide();
      });
  }
};

window.startEdit = function(key, title, desc, url, img) {
  window.editKey = key;
  const titleInput = document.getElementById('editTitle');
  const descInput = document.getElementById('editDesc');
  const urlInput = document.getElementById('editUrl');
  const imgLinkInput = document.getElementById('editImgLink');
  if (titleInput) titleInput.value = title;
  if (descInput) descInput.value = desc;
  if (urlInput) urlInput.value = url;
  if (imgLinkInput) imgLinkInput.value = img;
  const modal = document.getElementById('editModal');
  if (modal) {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  }
};

window.updateShortcut = function() {
  if (!currentUser || !window.editKey) {
    toast.error('Invalid operation');
    return;
  }

  const title = document.getElementById('editTitle').value.trim();
  const desc = document.getElementById('editDesc').value.trim();
  const url = document.getElementById('editUrl').value.trim();
  const imgLink = document.getElementById('editImgLink').value.trim();
  const file = document.getElementById('editImgFile').files[0];

  if (!title || !url) {
    toast.warning('Title and URL are required');
    return;
  }

  loading.show();

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      resizeImage(e.target.result, 256, 256, (resized) => {
        db.ref('users/' + currentUser.uid + '/shortcuts/' + window.editKey).set({ title, desc, url, img: resized })
          .then(() => {
            closeModal('editModal');
            renderAll();
            toast.success('Shortcut updated successfully');
            loading.hide();
          })
          .catch(err => {
            console.error('Error updating shortcut:', err);
            toast.error('Failed to update shortcut');
            loading.hide();
          });
      });
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
      loading.hide();
    };
    reader.readAsDataURL(file);
  } else {
    db.ref('users/' + currentUser.uid + '/shortcuts/' + window.editKey).set({ title, desc, url, img: imgLink })
      .then(() => {
        closeModal('editModal');
        renderAll();
        toast.success('Shortcut updated successfully');
        loading.hide();
      })
      .catch(err => {
        console.error('Error updating shortcut:', err);
        toast.error('Failed to update shortcut');
        loading.hide();
      });
  }
};

window.deleteShortcut = function(key) {
  if (!currentUser) {
    toast.error('Please login');
    return;
  }

  if (confirm("Are you sure you want to delete this shortcut?")) {
    loading.show();
    db.ref('users/' + currentUser.uid + '/shortcuts/' + key).remove()
      .then(() => {
        renderAll();
        toast.success('Shortcut deleted successfully');
        loading.hide();
      })
      .catch(err => {
        console.error('Error deleting shortcut:', err);
        toast.error('Failed to delete shortcut');
        loading.hide();
      });
  }
};

// Image resize utility
function resizeImage(dataUrl, maxW, maxH, callback) {
  const img = new Image();
  img.onload = () => {
    try {
      const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/png', 0.8));
    } catch (err) {
      console.error('Error resizing image:', err);
      toast.error('Failed to resize image');
      callback(dataUrl); // Fallback to original
    }
  };
  img.onerror = () => {
    console.error('Error loading image for resize');
    toast.error('Invalid image file');
    callback(dataUrl); // Fallback to original
  };
  img.src = dataUrl;
}

// Authentication functions
window.login = function() {
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;

  if (!email || !password) {
    toast.warning('Please enter email and password');
    return;
  }

  loading.show();
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      closeModal('loginModal');
      toast.success('Logged in successfully');
      loading.hide();
    })
    .catch(err => {
      console.error('Login error:', err);
      const errorMsg = err.code === 'auth/user-not-found' ? 'User not found'
        : err.code === 'auth/wrong-password' ? 'Incorrect password'
        : err.code === 'auth/invalid-email' ? 'Invalid email address'
        : err.message;
      toast.error('Login failed: ' + errorMsg);
      loading.hide();
    });
};

window.register = function() {
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;

  if (!email || !password) {
    toast.warning('Please enter email and password');
    return;
  }

  if (password.length < 6) {
    toast.warning('Password must be at least 6 characters');
    return;
  }

  loading.show();
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      closeModal('loginModal');
      toast.success('Account created successfully');
      loading.hide();
    })
    .catch(err => {
      console.error('Registration error:', err);
      const errorMsg = err.code === 'auth/email-already-in-use' ? 'Email already in use'
        : err.code === 'auth/invalid-email' ? 'Invalid email address'
        : err.code === 'auth/weak-password' ? 'Password is too weak'
        : err.message;
      toast.error('Registration failed: ' + errorMsg);
      loading.hide();
    });
};

// Theme management
document.addEventListener("DOMContentLoaded", () => {
  const themeBtn = document.getElementById('themeToggle');
  const avatarEl = document.getElementById('userAvatar');

  function applyTheme(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
      themeBtn.textContent = theme === 'dark' ? '☀️ Theme' : '🌗 Theme';
    }

    if (avatarEl && avatarEl.classList.contains('default-icon')) {
      avatarEl.src = theme === 'dark' ? './img/user_light.png' : './img/user.png';
    }
  }

  if (themeBtn) {
    themeBtn.onclick = () => {
      const currentTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(currentTheme);
    };
  }

  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  // Initialize buttons
  initButtons();
});

