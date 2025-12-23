/* ============================================================================
   AUTH PAGES CONTROLLER (Login & Password Reset)
   ---------------------------------------------------------------------------
   Handles:
   - Login flow
   - Forgot password flow (demo)
   - Password reset flow
   - Local/session storage utilities
============================================================================ */

/* ============================================================================
   IMPORTS
============================================================================ */
import { navigateTo } from './auth.js';

/* ============================================================================
   PUBLIC API
============================================================================ */

/**
 * Initializes authentication-related logic based on the current page.
 * Uses the `data-page` attribute on <body> to determine which logic to run.
 *
 * @example
 * <body data-page="login">
 */
export function setupAuth() {
    const page = document.body.dataset.page;

    if (page === 'login') initLoginPage();
    if (page === 'reset-password') initResetPasswordPage();
}

/* ============================================================================
   STORAGE UTILITIES
============================================================================ */

/**
 * Safely reads and parses JSON from localStorage.
 *
 * @param {string} key - Storage key
 * @param {*} fallback - Value to use if key does not exist
 * @returns {*}
 */
export function readLS(key, fallback = null) {
    return JSON.parse(localStorage.getItem(key) || fallback);
}

/**
 * Writes a value to localStorage as JSON.
 *
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
export function writeLS(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/* ============================================================================
   UI UTILITIES
============================================================================ */

/**
 * Displays a Bootstrap alert message inside a container element.
 *
 * @param {HTMLElement} container - Target element
 * @param {'success'|'danger'|'warning'|'info'} type - Alert type
 * @param {string} text - Message text
 */
export function showMessage(container, type, text) {
    if (!container) return;
    container.innerHTML = `<div class="alert alert-${type} py-2">${text}</div>`;
}

/* ============================================================================
   LOGIN PAGE LOGIC
============================================================================ */

/**
 * Initializes login page functionality:
 * - Login form submission
 * - Remember-me behavior
 * - Forgot password flow
 */
export function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    const forgotForm = document.getElementById('forgot-password-form');
    const forgotLink = document.getElementById('forgot-password-link');
    const backBtn = document.getElementById('back-to-login');
    const resetBtn = document.getElementById('reset-btn');

    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    const rememberCheckbox = document.getElementById('remember-me');
    const msg = document.getElementById('msg');

    if (!loginForm) return;

    /* ------------------------------------
       Forgot Password Message Container
    ------------------------------------ */
    const forgotMsg = document.createElement('div');
    forgotMsg.id = 'forgot-msg';
    forgotMsg.className = 'mt-2';
    forgotForm?.prepend(forgotMsg);

    /* ------------------------------------
       Prefill Email (Local or Session)
    ------------------------------------ */
    const savedLocal = readLS('activeUser', 'null');
    const savedSession = JSON.parse(sessionStorage.getItem('activeUser') || 'null');
    const prefillUser = savedLocal || savedSession;

    if (prefillUser) {
        emailInput.value = prefillUser.email || '';
        rememberCheckbox.checked = Boolean(savedLocal);
    }

    /* ------------------------------------
       Forgot Password Toggle
    ------------------------------------ */
    forgotLink?.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('d-none');
        forgotForm?.classList.remove('d-none');
        forgotMsg.innerHTML = '';
    });

    backBtn?.addEventListener('click', () => {
        forgotForm?.classList.add('d-none');
        loginForm.classList.remove('d-none');
        forgotMsg.innerHTML = '';
    });

    /* ------------------------------------
       Forgot Password Action (Demo)
    ------------------------------------ */
    resetBtn?.addEventListener('click', () => {
        const email = document.getElementById('reset-email')?.value.trim();
        forgotMsg.innerHTML = '';

        if (!email) {
            return showMessage(forgotMsg, 'danger', 'Please enter your email address.');
        }

        const users = readLS('users', []);
        const userExists = users.find(u => u.email === email);

        if (!userExists) {
            return showMessage(forgotMsg, 'danger', 'No user found with that email.');
        }

        forgotMsg.innerHTML = `
            <div class="alert alert-success py-2">
                A reset link has been generated.<br>
                <strong>Demo only — click below:</strong>
                <div class="mt-3">
                    <a href="reset-password.html?email=${encodeURIComponent(email)}"
                       class="btn btn-warning">
                        Reset Your Password
                    </a>
                </div>
            </div>
        `;
    });

    /* ------------------------------------
       Login Submission
    ------------------------------------ */
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        msg.innerHTML = '';

        const email = emailInput.value.trim();
        const password = passInput.value.trim();
        const rememberMe = rememberCheckbox.checked;

        if (!email || !password) {
            return showMessage(msg, 'danger', 'Please fill in both fields.');
        }

        const users = readLS('users', []);
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return showMessage(msg, 'danger', 'Invalid email or password.');
        }

        if (rememberMe) {
            writeLS('activeUser', user);
            sessionStorage.removeItem('activeUser');
        } else {
            sessionStorage.setItem('activeUser', JSON.stringify(user));
            localStorage.removeItem('activeUser');
        }

        showMessage(msg, 'success', 'Login successful! Redirecting...');
        setTimeout(() => navigateTo('index.html'), 1000);
    });
}

/* ============================================================================
   RESET PASSWORD PAGE LOGIC
============================================================================ */

/**
 * Initializes reset-password page functionality.
 * Handles password validation and updates user credentials.
 */
export function initResetPasswordPage() {
    const msg = document.getElementById('reset-msg');
    const emailDisplay = document.getElementById('reset-email-display');
    const resetSubmit = document.getElementById('reset-submit');

    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');

    if (emailDisplay) emailDisplay.textContent = email || '';

    if (!email) {
        return showMessage(msg, 'danger', 'Invalid or missing reset link.');
    }

    resetSubmit?.addEventListener('click', () => {
        msg.innerHTML = '';

        const pass1 = document.getElementById('new-password')?.value.trim();
        const pass2 = document.getElementById('confirm-password')?.value.trim();

        if (!pass1 || !pass2) {
            return showMessage(msg, 'danger', 'Please fill in both fields.');
        }

        if (pass1 !== pass2) {
            return showMessage(msg, 'danger', 'Passwords do not match.');
        }

        const users = readLS('users', []);
        const user = users.find(u => u.email === email);

        if (!user) {
            return showMessage(msg, 'danger', 'User not found.');
        }

        user.password = pass1;
        writeLS('users', users);

        showMessage(msg, 'success', 'Password updated! Redirecting...');
        setTimeout(() => navigateTo('login.html'), 2000);
    });
}