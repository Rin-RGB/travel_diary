import apiService from './apiService.js';
import { api } from './index.js';

if (!localStorage.getItem('feedPosts')) {
    const defaultPosts = [
        {
            id: 1,
            title: 'Музей Михаила Булгакова',
            city: 'Москва',
            description: 'Первый и единственный государственный мемориальный музей Булгакова в России, учрежденный в 2007 году в пространстве легендарной квартиры №50 в доме 10 на Большой Садовой.',
            image: 'images/bulgakov.jpg',
            date: '12 марта 2025',
            address: 'Большая Садовая ул., 10, 50',
            tags: ['музей']
        },
        {
            id: 2,
            title: 'Большой театр',
            city: 'Москва',
            description: 'Один из крупнейших и старейших в России и один из самых значительных в мире театров оперы и балета.',
            image: 'images/bolshoj-teatr.webp',
            date: '5 марта 2025',
            address: 'Театральная пл., 1',
            tags: ['театр']
        },
        {
            id: 3,
            title: 'Роза Хутор',
            city: 'Сочи',
            description: 'Курорт, расположенный на берегах реки Мзымта и горных склонах к югу от неё в Адлерском районе Сочи.',
            image: 'images/roza-hutor.jpg',
            date: '28 января 2025',
            address: '',
            tags: ['курорт']
        },
        {
            id: 4,
            title: 'Вулкан Бакенинг',
            city: 'Камчатка',
            description: 'Потухший стратовулкан на востоке полуострова Камчатка.',
            image: 'images/bakening.jpg',
            date: '17 ноября 2024',
            address: '',
            tags: ['вулкан']
        },
        {
            id: 5,
            title: 'Агурские водопады',
            city: 'Сочи',
            description: 'Каскад водопадов на реке Агура в Хостинском районе города Сочи.',
            image: 'images/agurskij-waterfall.jpg',
            date: '5 августа 2024',
            address: '',
            tags: ['водопад']
        },
        {
            id: 6,
            title: 'Музей Мирового океана',
            city: 'Калининград',
            description: 'Первый в России комплексный маринистический музей-заповедник, расположенный в Калининградской области.',
            image: 'images/musej-mirovogo-okeana.jpg',
            date: '1 июля 2024',
            address: 'наб. Петра Великого, 1',
            tags: ['музей']
        }
    ];
    localStorage.setItem('feedPosts', JSON.stringify(defaultPosts));
}

window.feedPosts = JSON.parse(localStorage.getItem('feedPosts'));

// Хранилище пользователей
let users = JSON.parse(localStorage.getItem('users')) || [];

// Создаем первого админа при отсутствии пользователей
if (users.length === 0) {
    users.push({
        id: 'admin-' + Date.now(),
        name: 'Администратор',
        email: 'admin@example.com',
        role: 'admin'
    });
    localStorage.setItem('users', JSON.stringify(users));
}

// Текущий пользователь
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Функция проверки авторизации
function isAuthenticated() {
    return currentUser !== null;
}

// Функция проверки прав администратора
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

// Генерация случайного 6-значного кода
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Отправка кода (имитация email)
function sendOTP(email, code) {
    // В реальном приложении здесь была бы отправка email
    console.log(`[OTP] Код для ${email}: ${code}`);
    alert(`Код подтверждения отправлен на ${email}\n\nВаш код: ${code}\n(в реальном приложении код придет на email)`);
    return true;
}

// Функция обновления UI в зависимости от роли
function updateUIForUser() {
    const suggestBtn = document.getElementById('suggestPlaceBtn');
    const adminManageBtn = document.getElementById('adminManageBtn');
    const authMenuItems = document.getElementById('authMenuItems');
    const logoutMenuItem = document.getElementById('logoutMenuItem');
    const collectionsMenuItem = document.getElementById('collectionsMenuItem');
    const settingsMenuItem = document.getElementById('settingsMenuItem');
    
    if (isAuthenticated()) {
        if (authMenuItems) authMenuItems.style.display = 'none';
        if (logoutMenuItem) logoutMenuItem.style.display = 'block';
        
        if (suggestBtn) {
            suggestBtn.style.display = isAdmin() ? 'flex' : 'none';
        }
        if (adminManageBtn) {
            adminManageBtn.style.display = isAdmin() ? 'flex' : 'none';
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

// Показать модальное окно входа (с email)
function showLoginModal(callback) {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        window.pendingAuthCallback = callback;
        
        // Сбрасываем форму
        const emailInput = document.getElementById('loginEmail');
        const codeInput = document.getElementById('loginCode');
        const sendCodeBtn = document.getElementById('sendCodeBtn');
        const submitBtn = document.getElementById('loginSubmitBtn');
        
        if (emailInput) emailInput.value = '';
        if (codeInput) {
            codeInput.style.display = 'none';
            codeInput.value = '';
        }
        if (sendCodeBtn) sendCodeBtn.style.display = 'block';
        if (submitBtn) submitBtn.style.display = 'none';
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

// Отправка кода для входа
async function sendLoginCode() {
    const email = document.getElementById('loginEmail').value.trim();
    
    if (!email) {
        alert('Введите email');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/v1/auth/code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email })
        });
        
        if (response.ok) {
            const codeInput = document.getElementById('loginCode');
            const sendCodeBtn = document.getElementById('sendCodeBtn');
            const submitBtn = document.getElementById('loginSubmitBtn');
            
            if (codeInput) codeInput.style.display = 'block';
            if (sendCodeBtn) sendCodeBtn.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'block';
            
            alert(`Код отправлен на ${email}\n`);
        } else {
            const error = await response.text();
            alert('Ошибка: ' + error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка соединения с сервером.');
    }
}

// Обработка входа с кодом
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
        updateUIForUser();
        closeLoginModal();
        
        if (window.pendingAuthCallback) {
            const callback = window.pendingAuthCallback;
            window.pendingAuthCallback = null;
            callback();
        }
        
        alert("Добро пожаловать!");
        
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        } else {
            if (typeof loadFeedFromServer === 'function') {
                loadFeedFromServer();
            }
        }
    } else {
        alert(result.error);
    }
}

// Регистрация (без пароля)
/*
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    
    if (!name || !email) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        alert('Пользователь с таким email уже существует');
        return;
    }
    
    const newUser = {
        id: 'user-' + Date.now(),
        name: name,
        email: email,
        role: 'user'
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Регистрация успешна! Теперь вы можете войти.');
    closeRegisterModal();
    showLoginModal();
}
*/

// Выход из аккаунта
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUIForUser();
    // Всегда перенаправляем на главную страницу
    window.location.href = 'index.html';
}

// Управление администраторами

function openAdminManageModal() {
    if (!isAdmin()) {
        alert('У вас нет прав для управления администраторами');
        return;
    }
    
    const modal = document.getElementById('adminManageModal');
    if (modal) {
        modal.style.display = 'flex';
        updateAdminList();
    }
}

function closeAdminManageModal() {
    const modal = document.getElementById('adminManageModal');
    if (modal) modal.style.display = 'none';
    document.getElementById('adminEmail').value = '';
}

function updateAdminList() {
    const adminList = document.getElementById('adminList');
    if (!adminList) return;
    
    const admins = users.filter(u => u.role === 'admin');
    
    if (admins.length === 0) {
        adminList.innerHTML = '<li>Нет администраторов</li>';
        return;
    }
    
    adminList.innerHTML = admins.map(admin => `
        <li style="padding: 8px 0; border-bottom: 1px solid var(--border-color);">
            <strong>${escapeHtml(admin.name)}</strong> — ${escapeHtml(admin.email)}
        </li>
    `).join('');
}

function addAdmin() {
    if (!isAdmin()) {
        alert('У вас нет прав для выполнения этого действия');
        return;
    }
    
    const email = document.getElementById('adminEmail').value.trim();
    
    if (!email) {
        alert('Введите email администратора');
        return;
    }
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
        alert('Пользователь с таким email не найден в системе');
        return;
    }
    
    if (user.role === 'admin') {
        alert('Этот пользователь уже является администратором');
        return;
    }
    
    user.role = 'admin';
    localStorage.setItem('users', JSON.stringify(users));
    
    if (currentUser && currentUser.email === email) {
        currentUser.role = 'admin';
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUIForUser();
    }
    
    updateAdminList();
    document.getElementById('adminEmail').value = '';
    alert(`Пользователь ${user.email} теперь администратор`);
}

function removeAdmin() {
    if (!isAdmin()) {
        alert('У вас нет прав для выполнения этого действия');
        return;
    }
    
    const email = document.getElementById('adminEmail').value.trim();
    
    if (!email) {
        alert('Введите email администратора');
        return;
    }
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
        alert('Пользователь с таким email не найден в системе');
        return;
    }
    
    if (user.role !== 'admin') {
        alert('Этот пользователь не является администратором');
        return;
    }
    
    const adminsCount = users.filter(u => u.role === 'admin').length;
    if (adminsCount <= 1) {
        alert('Нельзя удалить последнего администратора системы');
        return;
    }
    
    user.role = 'user';
    localStorage.setItem('users', JSON.stringify(users));
    
    if (currentUser && currentUser.email === email) {
        currentUser.role = 'user';
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUIForUser();
        closeAdminManageModal();
        alert('Ваша роль была изменена на "пользователь"');
    }
    
    updateAdminList();
    document.getElementById('adminEmail').value = '';
    alert(`Пользователь ${user.email} больше не администратор`);
}

// ============ ЗАЩИТА МАРШРУТОВ ============

function requireAuth(targetUrl) {
    if (isAuthenticated()) {
        window.location.href = targetUrl;
    } else {
        showLoginModal(() => {
            window.location.href = targetUrl;
        });
    }
}

function requireAuthForAction(callback) {
    if (isAuthenticated()) {
        if (callback) callback();
    } else {
        showLoginModal(callback);
    }
}

// ============ ДОБАВЛЕНИЕ МЕСТА В БАЗУ ДАННЫХ ============

function openAddPlaceModal() {
    if (!isAdmin()) {
        alert('Только администраторы могут добавлять места');
        return;
    }
    
    let modal = document.getElementById('addPlaceModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'addPlaceModal';
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content" style="max-width: 600px;">
                <div class="auth-modal-header">
                    <h2>Добавление места в базу данных</h2>
                    <button class="auth-modal-close" onclick="closeAddPlaceModal()">✕</button>
                </div>
                <div class="auth-modal-body">
                    <form id="addPlaceForm">
                        <div class="form-group">
                            <label for="placeTitle">Название места *</label>
                            <input type="text" id="placeTitle" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label for="placeCity">Город *</label>
                            <input type="text" id="placeCity" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label for="placeAddress">Адрес</label>
                            <input type="text" id="placeAddress" class="form-input">
                        </div>
                        <div class="form-group">
                            <label for="placeDescription">Описание</label>
                            <textarea id="placeDescription" class="form-textarea" rows="4"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="placeImageURL">URL изображения</label>
                            <input type="text" id="placeImageURL" class="form-input" placeholder="https://example.com/image.jpg">
                        </div>
                        <div class="form-group">
                            <label>Теги</label>
                            <div id="placeTags" style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${['музей', 'театр', 'курорт', 'вулкан', 'водопад', 'гейзер', 'море'].map(tag => `
                                    <label style="display: flex; align-items: center; gap: 4px;">
                                        <input type="checkbox" value="${tag}"> #${tag}
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        <button type="submit" class="submit-btn" style="width: 100%; margin-top: 16px;">Добавить место</button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.style.display = 'flex';
    
    const form = document.getElementById('addPlaceForm');
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    newForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('placeTitle').value.trim();
        const city = document.getElementById('placeCity').value.trim();
        const address = document.getElementById('placeAddress').value.trim();
        const description = document.getElementById('placeDescription').value.trim();
        let image = document.getElementById('placeImageURL').value.trim();
        
        if (!title || !city) {
            alert('Пожалуйста, заполните обязательные поля (название и город)');
            return;
        }
        
        if (!image) {
            image = 'https://via.placeholder.com/400x200?text=Новое+место';
        }
        
        const selectedTags = Array.from(document.querySelectorAll('#placeTags input:checked')).map(cb => cb.value);
        if (selectedTags.length === 0) {
            alert('Выберите хотя бы один тег');
            return;
        }
        
        const newPost = {
            id: Date.now(),
            title: title,
            city: city,
            description: description || 'Новое место',
            image: image,
            date: new Date().toLocaleDateString('ru-RU'),
            address: address,
            tags: selectedTags
        };
        
        window.feedPosts.push(newPost);
        alert('Место успешно добавлено в ленту!');
        
        closeAddPlaceModal();
        if (typeof renderFeed === 'function') renderFeed();
    });
}

function closeAddPlaceModal() {
    const modal = document.getElementById('addPlaceModal');
    if (modal) modal.style.display = 'none';
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

// ============ ИНИЦИАЛИЗАЦИЯ ============

const originalTogglePostInCollection = window.togglePostInCollection;
window.togglePostInCollection = function(postId, collectionId) {
    requireAuthForAction(() => {
        if (originalTogglePostInCollection) {
            originalTogglePostInCollection(postId, collectionId);
        }
    });
};

document.addEventListener('DOMContentLoaded', function() {
    updateUIForUser();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLoginWithCode);
    
    const registerForm = document.getElementById('registerForm');
    //if (registerForm) registerForm.addEventListener('submit', handleRegister);
    
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
            if (isAdmin()) {
                openAddPlaceModal();
            } else if (isAuthenticated()) {
                alert('Только администраторы могут добавлять места');
            } else {
                showLoginModal(() => {
                    alert('Только администраторы могут добавлять места');
                });
            }
        });
    }
    
    const adminManageBtn = document.getElementById('adminManageBtn');
    if (adminManageBtn) {
        adminManageBtn.addEventListener('click', openAdminManageModal);
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
        
        .top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }
        
        .top-row-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .top-row-right {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        #adminList {
            max-height: 200px;
            overflow-y: auto;
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

// Делаем функции глобальными
window.sendLoginCode = sendLoginCode;
window.closeLoginModal = closeLoginModal;
window.handleLoginWithCode = handleLoginWithCode;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.closeRegisterModal = closeRegisterModal;
window.openAdminManageModal = openAdminManageModal;
window.closeAdminManageModal = closeAdminManageModal;
window.addAdmin = addAdmin;
window.removeAdmin = removeAdmin;
window.openAddPlaceModal = openAddPlaceModal;
window.closeAddPlaceModal = closeAddPlaceModal;