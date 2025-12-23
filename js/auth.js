/* ============================================================================
   AUTH, NAVIGATION & USER STATE MODULE
   ----------------------------------------------------------------------------
   Responsibilities:
   - Page navigation abstraction (test-friendly)
   - Authentication state management
   - Registration & login flows
   - Navbar access control
   - Profile management (update & delete)
============================================================================ */

/* ============================================================================
   NAVIGATION
============================================================================ */

/**
 * Navigates to a new page.
 * Falls back to `window.mockHref` when running tests.
 *
 * @param {string} url - Destination URL
 */
export function navigateTo(url) {
    if (typeof window.mockHref !== 'undefined') {
        window.mockHref = url;
    } else {
        window.location.href = url;
    }
}

/* ============================================================================
   AUTH STATE
============================================================================ */

/**
 * Retrieves the currently authenticated user from localStorage.
 *
 * @returns {Object|null} Active user or null if not logged in
 */
export function getCurrentUser() {
    return JSON.parse(localStorage.getItem('activeUser') || 'null');
}

/**
 * Logs the current user out and redirects to login.
 */
export function logout() {
    localStorage.removeItem('activeUser');
    navigateTo('login.html');
}

/* ============================================================================
   INTERNAL UTILITIES
============================================================================ */

/**
 * Displays a simple inline message.
 *
 * @param {HTMLElement} el - Target element
 * @param {string} text - Message text
 * @param {'success'|'error'} [type='success'] - Message type
 */
function showMessage(el, text, type = 'success') {
    if (!el) return;
    el.style.color = type === 'error' ? 'red' : 'green';
    el.textContent = text;
}

/**
 * Validates email format.
 *
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

/**
 * Toggles a loading spinner inside a button.
 *
 * @param {HTMLButtonElement} button
 * @param {boolean} [show=true]
 */
function toggleButtonSpinner(button, show = true) {
    if (!button) return;
    const spinner = button.querySelector('.spinner-border');
    if (spinner) spinner.style.display = show ? 'inline-block' : 'none';
    button.disabled = show;
}

/* ============================================================================
   REGISTER PAGE
============================================================================ */

/**
 * Initializes the registration page logic.
 * Handles validation, persistence, and auto-login.
 */
export function setupRegisterPage() {
    const form = document.getElementById('register-form');
    const msg = document.getElementById('msg');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('reg-name')?.value.trim();
        const email = document.getElementById('reg-email')?.value.trim();
        const password = document.getElementById('reg-password')?.value.trim();
        const address = document.getElementById('reg-address')?.value.trim();

        if (!name || !email || !password || !address) {
            return showMessage(msg, 'All fields are required!', 'error');
        }

        if (!validateEmail(email)) {
            return showMessage(msg, 'Invalid email format!', 'error');
        }

        if (password.length < 6) {
            return showMessage(msg, 'Password must be at least 6 characters!', 'error');
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');

        if (users.some(u => u.email === email)) {
            return showMessage(msg, 'Email already registered!', 'error');
        }

        const newUser = { name, email, password, address };
        users.push(newUser);

        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('activeUser', JSON.stringify(newUser));

        showMessage(msg, 'Registration successful! Redirecting...');
        setTimeout(() => navigateTo('index.html'), 1500);
    });
}

/* ============================================================================
   LOGIN PAGE
============================================================================ */

/**
 * Initializes login page logic.
 * Supports email remembering and authentication.
 */
export function setupLoginPage() {
    const form = document.getElementById('login-form');
    const msg = document.getElementById('msg');
    const rememberMe = document.getElementById('remember-me');
    if (!form) return;

    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('login-email').value = rememberedEmail;
        rememberMe.checked = true;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email')?.value.trim();
        const password = document.getElementById('login-password')?.value.trim();

        if (!email || !password) {
            return showMessage(msg, 'Both fields are required!', 'error');
        }

        if (!validateEmail(email)) {
            return showMessage(msg, 'Invalid email!', 'error');
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return showMessage(msg, 'Incorrect email or password!', 'error');
        }

        localStorage.setItem('activeUser', JSON.stringify(user));

        if (rememberMe?.checked) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        showMessage(msg, 'Login successful! Redirecting...');
        setTimeout(() => navigateTo('index.html'), 1500);
    });
}

/* ============================================================================
   NAVBAR ACCESS CONTROL
============================================================================ */

/**
 * Controls navbar visibility and protects restricted pages.
 */
export function setupNavbarLogic() {
    const btnLoginState = document.getElementById('btn-login-state');
    const btnLogout = document.getElementById('btn-logout');
    const navWelcome = document.getElementById('nav-welcome');
    const navProfile = document.querySelector('a[href="profile.html"]');
    const navCheckout = document.getElementById('nav-checkout');
    const navCart = document.getElementById('nav-cart');

    const user = getCurrentUser();

    if (user) {
        btnLoginState?.classList.add('d-none');

        btnLogout?.classList.remove('d-none');
        btnLogout.onclick = logout;

        navWelcome.textContent = `Welcome, ${user.name}`;
        navWelcome.classList.remove('d-none');

        navProfile?.classList.remove('d-none');
        navCheckout?.classList.remove('d-none');
        navCart?.classList.remove('d-none');
    } else {
        btnLoginState?.classList.remove('d-none');
        btnLogout?.classList.add('d-none');
        navWelcome?.classList.add('d-none');
        navProfile?.classList.add('d-none');
        navCheckout?.classList.add('d-none');
        navCart?.classList.add('d-none');
    }

    const protectedPages = ['checkout.html', 'cart.html', 'profile.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !user) {
        navigateTo('login.html');
    }
}

/* ============================================================================
   PROFILE PAGE
============================================================================ */

/**
 * Initializes profile page logic.
 * Handles updates and account deletion.
 */
export function setupProfilePage() {
    const user = getCurrentUser();
    if (!user) return navigateTo('login.html');

    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    const addressInput = document.getElementById('profile-address');

    const displayName = document.getElementById('profile-name-display');
    const displayEmail = document.getElementById('profile-email-display');

    nameInput.value = user.name;
    emailInput.value = user.email;
    addressInput.value = user.address;

    displayName.textContent = user.name;
    displayEmail.textContent = user.email;

    let msgEl = document.getElementById('profile-msg');
    if (!msgEl) {
        msgEl = document.createElement('div');
        msgEl.id = 'profile-msg';
        msgEl.className = 'alert d-none text-center';
        document.querySelector('.profile-card form')?.prepend(msgEl);
    }

    const showInlineMessage = (text, type = 'success') => {
        msgEl.textContent = text;
        msgEl.className = `alert alert-${type} text-center`;
        msgEl.classList.remove('d-none');
        setTimeout(() => msgEl.classList.add('d-none'), 3000);
    };

    const form = document.getElementById('profile-form');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();

        const updateBtn = form.querySelector('.btn-update');
        toggleButtonSpinner(updateBtn, true);

        const updatedUser = {
            ...user,
            name: nameInput.value.trim(),
            address: addressInput.value.trim()
        };

        localStorage.setItem('activeUser', JSON.stringify(updatedUser));

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        localStorage.setItem(
            'users',
            JSON.stringify(users.map(u => u.email === updatedUser.email ? updatedUser : u))
        );

        displayName.textContent = updatedUser.name;
        document.getElementById('nav-welcome').textContent = `Welcome, ${updatedUser.name}`;

        showInlineMessage('Profile updated successfully!');
        setTimeout(() => toggleButtonSpinner(updateBtn, false), 1500);
    });

    const deleteBtn = document.getElementById('btn-delete-account');
    deleteBtn?.addEventListener('click', () => {
        toggleButtonSpinner(deleteBtn, true);

        localStorage.removeItem('activeUser');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        localStorage.setItem(
            'users',
            JSON.stringify(users.filter(u => u.email !== user.email))
        );

        showInlineMessage('Your account has been deleted.', 'danger');
        setTimeout(() => navigateTo('index.html'), 1500);
    });
}

/* ============================================================================
   PAGE ROUTER
============================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;

    if (page === 'register') setupRegisterPage();
    if (page === 'login') setupLoginPage();
    if (page === 'profile') setupProfilePage();

    setupNavbarLogic();
});