import apiService from './apiService.js';
import api from './index.js';

function isAuthenticated() {
    return localStorage.getItem('access_token') !== null;
}

async function isAdmin() {
    if (!isAuthenticated()) return false;
    
    try {
        const userData = await apiService.getCurrentUser();
        if (!userData) return false;
        const role = typeof userData.role === 'object' ? userData.role.role : userData.role;
        return role === 'admin';
    } catch (error) {
        console.error('Check admin error:', error);
        return false;
    }
}

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

async function updateUIForUser() {
    const suggestBtn = document.getElementById('suggestPlaceBtn');
    const adminManageBtn = document.getElementById('adminManageBtn');
    const authMenuItems = document.getElementById('authMenuItems');
    const logoutMenuItem = document.getElementById('logoutMenuItem');
    const collectionsMenuItem = document.getElementById('collectionsMenuItem');
    const settingsMenuItem = document.getElementById('settingsMenuItem');
    
    const authenticated = isAuthenticated();
    const admin = authenticated ? await isAdmin() : false;
    
    if (authenticated) {
        if (authMenuItems) authMenuItems.style.display = 'none';
        if (logoutMenuItem) logoutMenuItem.style.display = 'block';
        
        if (suggestBtn) {
            suggestBtn.style.display = admin ? 'flex' : 'none';
        }
        if (adminManageBtn) {
            adminManageBtn.style.display = admin ? 'flex' : 'none';
        }
        
        if (collectionsMenuItem) collectionsMenuItem.style.display = 'flex';
        if (settingsMenuItem) settingsMenuItem.style.display = 'flex';
    } else {
        if (authMenuItems) authMenuItems.style.display = 'block';
        if (logoutMenuItem) logoutMenuItem.style.display = 'none';
        
        if (suggestBtn) suggestBtn.style.display = 'none';
        if (adminManageBtn) adminManageBtn.style.display = 'none';
        
        if (collectionsMenuItem) collectionsMenuItem.style.display = 'none';
        if (settingsMenuItem) settingsMenuItem.style.display = 'none';
    }
}

function showLoginModal(callback) {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        window.pendingAuthCallback = callback;
        const emailInput = document.getElementById('loginEmail');
        const codeInput = document.getElementById('loginCode');
        const sendCodeBtn = document.getElementById('sendCodeBtn');
        const submitBtn = document.getElementById('loginSubmitBtn');
        if (emailInput) emailInput.value = '';
        if (codeInput) codeInput.value = '';
        if (codeInput) codeInput.style.display = 'block';
        if (sendCodeBtn) sendCodeBtn.style.display = 'block';
        if (submitBtn) submitBtn.style.display = 'block';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('loginForm');
    if (form) form.reset();
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('registerForm');
    if (form) form.reset();
}

function switchToRegister() {
    closeLoginModal();
    const registerModal = document.getElementById('registerModal');
    if (registerModal) registerModal.style.display = 'flex';
}

function switchToLogin() {
    closeRegisterModal();
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.style.display = 'flex';
}

async function sendLoginCode() {
    const email = document.getElementById('loginEmail').value.trim();
    const code = document.getElementById('loginCode').value.trim();
    if (code && code.length === 6) {
        await handleLoginWithCode(new Event('submit'));
        return;
    }
    if (!email) {
        alert('Введите email');
        return;
    }
    
    try {
        const response = await api.sendCode(email);
        
        if (response) {
            alert(`Код отправлен на ${email}`);
            const codeInput = document.getElementById('loginCode');
            if (codeInput) {
                codeInput.focus();
            }
        }
    } catch (error) {
        console.error('Send code error:', error);
        alert('Ошибка отправки кода: ' + (error.response?.data?.detail || 'Попробуйте позже'));
    }
}

async function handleLoginWithCode(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const code = document.getElementById('loginCode').value.trim();
    
    if (!email || !code) {
        alert('Введите email и код подтверждения');
        return;
    }
    
    const result = await apiService.login(email, code);
    
    if (result.success) {
        currentUser = result.user;
        await updateUIForUser();
        closeLoginModal();
        
        if (window.pendingAuthCallback) {
            const callback = window.pendingAuthCallback;
            window.pendingAuthCallback = null;
            callback();
        }
        
        alert("Добро пожаловать!");
        if (typeof loadAndRenderFeed === 'function') {
            loadAndRenderFeed();
        } else {
            window.location.reload();
        }
    } else {
        alert(result.error);
    }
}

function logout() {
    apiService.logout();
    currentUser = null;
    updateUIForUser();
    window.location.href = 'index.html';
}

function requireAuth(targetUrl) {
    if (isAuthenticated()) {
        window.location.href = targetUrl;
    } else {
        showLoginModal(() => {
            window.location.href = targetUrl;
        });
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', function() {
    updateUIForUser();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLoginWithCode);
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    const suggestPlaceBtn = document.getElementById('suggestPlaceBtn');
    if (suggestPlaceBtn) {
        suggestPlaceBtn.addEventListener('click', () => {
            alert('Функция добавления места в разработке');
        });
    }
    
    const adminManageBtn = document.getElementById('adminManageBtn');
    if (adminManageBtn) {
        adminManageBtn.addEventListener('click', () => {
            alert('Функция управления администраторами в разработке');
        });
    }
    
    const collectionsMenuItem = document.getElementById('collectionsMenuItem');
    if (collectionsMenuItem) {
        collectionsMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            requireAuth('collections.html');
        });
    }
    
    const settingsMenuItem = document.getElementById('settingsMenuItem');
    if (settingsMenuItem) {
        settingsMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            requireAuth('settings.html');
        });
    }
    
    const loginMenuItem = document.getElementById('loginMenuItem');
    if (loginMenuItem) {
        loginMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();
        });
    }
    
    const registerMenuItem = document.getElementById('registerMenuItem');
    if (registerMenuItem) {
        registerMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            const registerModal = document.getElementById('registerModal');
            if (registerModal) registerModal.style.display = 'flex';
        });
    }
    
    addAuthStyles();
});

function addAuthStyles() {
    if (document.getElementById('auth-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'auth-styles';
    styles.textContent = `
        .auth-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
        }
        
        .auth-modal-content {
            background: var(--card-bg);
            border-radius: 24px;
            width: 90%;
            max-width: 450px;
            box-shadow: var(--card-shadow);
        }
        
        .auth-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .auth-modal-header h2 {
            margin: 0;
            font-size: 24px;
            color: var(--text-color);
        }
        
        .auth-modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--text-color);
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }
        
        .auth-modal-close:hover {
            background: var(--accent-color);
            color: white;
        }
        
        .auth-modal-body {
            padding: 24px;
        }
        
        .auth-switch {
            text-align: center;
            margin-top: 20px;
            color: var(--text-color);
        }
        
        .auth-switch a {
            color: var(--accent-color);
            text-decoration: none;
        }
        
        .auth-switch a:hover {
            text-decoration: underline;
        }
        
        #loginCode {
            display: none;
        }
        
        #loginSubmitBtn {
            display: none;
        }
        
        #sendCodeBtn {
            display: block;
            width: 100%;
            margin-top: 8px;
        }
        
        .otp-info {
            font-size: 12px;
            color: var(--tag-color);
            text-align: center;
            margin-top: 8px;
        }
    `;
    document.head.appendChild(styles);
}

window.sendLoginCode = sendLoginCode;
window.closeLoginModal = closeLoginModal;
window.handleLoginWithCode = handleLoginWithCode;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.closeRegisterModal = closeRegisterModal;
window.isAuthenticated = isAuthenticated;
window.isAdmin = isAdmin;
window.updateUIForUser = updateUIForUser;