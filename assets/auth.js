const AUTH_KEY = 'namal_fyp_session';
const TOKEN_KEY = 'namal_fyp_token';

const DASHBOARDS = {
    student: 'student/dashboard.html',
    faculty: 'faculty/dashboard.html',
    evaluator: 'evaluator/dashboard.html',
    coordinator: 'coordinator/dashboard.html',
    superadmin: 'superadmin/dashboard.html'
};

function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/student/') || path.includes('/faculty/') ||
        path.includes('/evaluator/') || path.includes('/coordinator/') ||
        path.includes('/superadmin/')) {
        return '../';
    }
    return '';
}

function saveSession(user, token) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
}

function getSession() {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
}

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function clearSession() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
}

async function login(username, password, remember = false) {
    const base = getBasePath();
    const errorEl = document.getElementById('login-error');

    try {
        const response = await fetch(base + 'api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            if (errorEl) {
                errorEl.classList.remove('hidden');
                errorEl.textContent = data.message || 'Invalid username or password.';
            }
            return false;
        }

        saveSession(data.user, data.token);
        window.location.href = base + DASHBOARDS[data.user.role];
        return true;
    } catch (err) {
        console.error('Login Error:', err);
        if (errorEl) {
            errorEl.classList.remove('hidden');
            errorEl.textContent = 'Connection error. Make sure backend is running.';
        }
        return false;
    }
}

function logout() {
    clearSession();
    const base = getBasePath();
    window.location.href = base + 'index.html';
}

function requireAuth(allowedRoles) {
    const session = getSession();
    const token = getToken();
    const base = getBasePath();

    if (!session || !token) {
        window.location.href = base + 'index.html';
        return null;
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
        window.location.href = base + DASHBOARDS[session.role];
        return null;
    }

    return session;
}

async function handleLoginForm(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember')?.checked || false;
    await login(username, password, remember);
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginForm);
    }
});
