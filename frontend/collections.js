// import axios from 'axios';
import apiService from './apiService.js';

let userCollections = [];
let allPlaces = [];

// Функция для экранирования HTML
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function loadCollectionsFromBackend() {
    try {
        userCollections = await apiService.getCollections();
        return userCollections;
    } catch (error) {
        console.error('Error loading collections:', error);
        return [];
    }
}

async function loadAllPlaces() {
    try {
        const response = await api.getPlaces({ limit: 100 });
        allPlaces = response.items || [];
        return allPlaces;
    } catch (error) {
        console.error('Error loading places:', error);
        return [];
    }
}

async function getCollectionPlacesCount(collectionId) {
    try {
        const collection = await apiService.getOneCollection(collectionId, { limit: 1 });
        return collection.total || 0;
    } catch (error) {
        console.error('Error getting collection places count:', error);
        return 0;
    }
}

async function getCollectionPreview(collectionId) {
    try {
        const collection = await apiService.getOneCollection(collectionId, { limit: 3 });
        return collection.places || [];
    } catch (error) {
        console.error('Error getting collection preview:', error);
        return [];
    }
}

async function renderCollectionsList() {
    const container = document.getElementById('collectionsList');
    if (!container) return;
    await loadCollectionsFromBackend();

    if (userCollections.length === 0) {
        container.innerHTML = '<div class="no-posts"><i class="bi bi-folder"></i><h3>Нет коллекций</h3><p>Создайте первую коллекцию</p></div>';
        return;
    }

    container.innerHTML = '<div class="loading">Загрузка коллекций...</div>';
    let html = '';
    for (const collection of userCollections) {
        const previewPlaces = await getCollectionPreview(collection.id);
        const placesCount = await getCollectionPlacesCount(collection.id);
        
        html += `
            <div class="collection-card" data-collection-id="${collection.id}">
                <div class="collection-header">
                    <div class="collection-title-wrapper">
                        <h2 class="collection-title">${escapeHtml(collection.name)}</h2>
                        <span class="collection-count">${placesCount}</span>
                    </div>
                    <div class="collection-actions-dropdown">
                        <button class="collection-menu-btn" onclick="event.stopPropagation(); toggleCollectionMenu('${collection.id}')">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <div class="collection-menu" id="menu-${collection.id}">
                            <button onclick="event.stopPropagation(); editCollectionName('${collection.id}')">
                                <i class="bi bi-pencil"></i> Редактировать
                            </button>
                            <button onclick="event.stopPropagation(); deleteCollection('${collection.id}')">
                                <i class="bi bi-trash"></i> Удалить
                            </button>
                        </div>
                    </div>
                </div>
                <div class="collection-preview">
                    ${renderCollectionPreview(previewPlaces)}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    initCollectionClicks();
}

function renderCollectionPreview(places) {
    if (!places || places.length === 0) {
        return '<div class="collection-empty-text">Нет мест в коллекции</div>';
    }
    
    return `
        <div class="collection-preview-images">
            ${places.slice(0, 3).map(place => `
                <img src="${place.cover_photo || ''}" class="preview-image" onerror="this.src='https://via.placeholder.com/80x80?text=Нет+фото'">
            `).join('')}
        </div>
    `;
}

window.toggleCollectionMenu = function(collectionId) {
    const menu = document.getElementById(`menu-${collectionId}`);
    if (!menu) return;
    
    document.querySelectorAll('.collection-menu.show').forEach(openMenu => {
        if (openMenu.id !== `menu-${collectionId}`) {
            openMenu.classList.remove('show');
        }
    });
    
    menu.classList.toggle('show');
};

window.editCollectionName = async function(collectionId) {
    const collection = userCollections.find(c => c.id === collectionId);
    if (!collection) return;

    const newName = prompt('Введите новое название для коллекции:', collection.name);
    if (newName && newName.trim() !== '') {
        const result = await apiService.editCollection(collectionId, newName.trim());
        if (result.success) {
            await renderCollectionsList();
        } else {
            alert('Ошибка редактирования: ' + result.error);
        }
    }
};

window.deleteCollection = async function(collectionId) {
    const collection = userCollections.find(c => c.id === collectionId);
    if (!collection) return;

    if (confirm(`Вы уверены, что хотите удалить коллекцию "${collection.name}"?`)) {
        const result = await apiService.deleteCollection(collectionId);
        if (result.success) {
            await renderCollectionsList();
        } else {
            alert('Ошибка удаления: ' + result.error);
        }
    }
};

// Добавление коллекции
window.addCollection = async function() {
    const name = prompt('Введите название новой коллекции:');
    if (name && name.trim()) {
        const result = await apiService.createCollection(name.trim());
        if (result.success) {
            await renderCollectionsList();
        } else {
            alert('Ошибка создания: ' + result.error);
        }
    }
};

// Открытие детальной страницы коллекции
window.openCollectionDetail = function(collectionId) {
    window.location.href = `collection_detail.html?id=${collectionId}`;
};

// Клик по карточке коллекции
function initCollectionClicks() {
    const cards = document.querySelectorAll('.collection-card');
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.collection-actions-dropdown')) return;
            const collectionId = this.dataset.collectionId;
            if (collectionId) {
                window.openCollectionDetail(collectionId);
            }
        });
    });
}

// Инициализация темы
function initCollectionsTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('i');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (icon) {
            icon.classList.remove('bi-moon');
            icon.classList.add('bi-sun');
        }
    }
    
    themeToggle.addEventListener('click', () => {
        const html = document.documentElement;
        if (html.hasAttribute('data-theme')) {
            html.removeAttribute('data-theme');
            if (icon) {
                icon.classList.remove('bi-sun');
                icon.classList.add('bi-moon');
            }
            localStorage.setItem('theme', 'light');
        } else {
            html.setAttribute('data-theme', 'dark');
            if (icon) {
                icon.classList.remove('bi-moon');
                icon.classList.add('bi-sun');
            }
            localStorage.setItem('theme', 'dark');
        }
    });
}

// Меню дропдаун
function initCollectionsDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const dropdown = document.getElementById('dropdownMenu');
    
    if (!profileBtn || !dropdown) return;
    
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });
}

// Выход
function initCollectionsLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Вы уверены, что хотите выйти?')) {
                apiService.logout();
                window.location.href = 'index.html';
            }
        });
    }
}

function addCollectionStyles() {
    if (document.getElementById('collection-preview-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'collection-preview-styles';
    styles.textContent = `
        .collection-preview {
            margin-top: 16px;
        }
        .collection-preview-images {
            display: flex;
            gap: 8px;
        }
        .preview-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 12px;
        }
        .collection-empty-text {
            color: var(--tag-color);
            font-size: 14px;
            padding: 12px 0;
        }
        .collection-card {
            cursor: pointer;
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: var(--text-color);
        }
    `;
    document.head.appendChild(styles);
}

// Закрытие меню при клике вне
document.addEventListener('click', function(event) {
    if (!event.target.closest('.collection-actions-dropdown')) {
        document.querySelectorAll('.collection-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

document.addEventListener('DOMContentLoaded', async function() {
    addCollectionStyles();
    if (!localStorage.getItem('access_token')) {
        window.location.href = 'index.html';
        return;
    }
    
    await renderCollectionsList();
    
    const addBtn = document.getElementById('addCollectionPageBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.addCollection();
        });
    }
    
    initCollectionsTheme();
    initCollectionsDropdown();
    initCollectionsLogout();
});

window.renderCollectionsList = renderCollectionsList;

