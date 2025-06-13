import { auth } from '../config/firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const loginContainer = document.querySelector('.login-container');
const loginTitle = document.getElementById('login-title');
const usernameField = document.getElementById('username');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const confirmButton = document.getElementById('confirm-button');
const signupBtn = document.getElementById('signupBtn');
const resetBtn = document.getElementById('resetBtn');
const loginBtn = document.getElementById('loginBtn');

let mode = 'login';

window.setMode = (newMode) => {
  mode = newMode;

  if (newMode === 'login') {
    loginTitle.textContent = 'Login';
    usernameField.style.display = 'none';
    emailField.style.display = 'block';
    passwordField.style.display = 'block';
    confirmButton.textContent = 'Login';
    loginBtn.style.display = 'none';
    signupBtn.style.display = 'inline-block';
    resetBtn.style.display = 'inline-block';
  } else if (newMode === 'signup') {
    loginTitle.textContent = 'Sign Up';
    usernameField.style.display = 'block';
    emailField.style.display = 'block';
    passwordField.style.display = 'block';
    confirmButton.textContent = 'Sign Up';
    loginBtn.style.display = 'inline-block';
    signupBtn.style.display = 'none';
    resetBtn.style.display = 'inline-block';
  } else if (newMode === 'reset') {
    loginTitle.textContent = 'Reset Password';
    usernameField.style.display = 'none';
    passwordField.style.display = 'none';
    emailField.style.display = 'block';
    confirmButton.textContent = 'Send Reset Link';
    loginBtn.style.display = 'inline-block';
    signupBtn.style.display = 'inline-block';
    resetBtn.style.display = 'none';
  }
};

window.confirmAction = () => {
  const email = emailField.value;
  const password = passwordField.value;
  const username = usernameField.value;

  if (mode === 'login') {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => window.location.href = 'app.html')
      .catch(err => alert(err.message));
  } else if (mode === 'signup') {
    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        return updateProfile(userCredential.user, { displayName: username });
      })
      .then(() => alert('Account created! Please log in.'))
      .catch(err => alert(err.message));
  } else if (mode === 'reset') {
    sendPasswordResetEmail(auth, email)
      .then(() => alert('Password reset email sent.'))
      .catch(err => alert(err.message));
  }
};
