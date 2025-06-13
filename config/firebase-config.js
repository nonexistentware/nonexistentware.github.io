// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDqTYRWnOALyjALg2Y5wSoCySoD9POoFjE",
    authDomain: "web-note-app-f928e.firebaseapp.com",
    projectId: "web-note-app-f928e",
    storageBucket: "web-note-app-f928e.firebasestorage.app",
    messagingSenderId: "639121324059",
    appId: "1:639121324059:web:cbfaf64e008fd94b60a0be",
    measurementId: "G-CFPSHZSRZ5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };
