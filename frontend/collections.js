let userCollections = [];
let postCollections = [];

window.isAuthenticated = function() {
    return localStorage.getItem('currentUser') !== null;
};

window.isAdmin = function() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.role === 'admin';
};

window.updateUIForUser = function() {
};

function loadCollectionsData() {
    userCollections = JSON.parse(localStorage.getItem('collections')) || [];
    postCollections = JSON.parse(localStorage.getItem('postCollections')) || [];
    
    // Если нет коллекций - создаем стандартные
    if (userCollections.length === 0) {
        userCollections = [
            { id: 'want-to-visit', name: 'Хочу посетить', editable: false },
            { id: 'visited', name: 'Посещено', editable: false }
        ];
        localStorage.setItem('collections', JSON.stringify(userCollections));
    }
}

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

// Функция рендеринга списка коллекций
function renderCollectionsList() {
    const container = document.getElementById('collectionsList');
    if (!container) {
        return;
    }

    loadCollectionsData();
    
    const posts = window.feedPosts || [];

    if (userCollections.length === 0) {
        container.innerHTML = '<div class="no-posts"><h3>Нет коллекций</h3><p>Создайте первую коллекцию</p></div>';
        return;
    }

    let html = '';
    userCollections.forEach(collection => {
        const postIds = postCollections
            .filter(pc => pc.collectionId === collection.id)
            .map(pc => pc.postId);
        const collectionPosts = posts.filter(post => postIds.includes(post.id));

        html += `
            <div class="collection-card" data-collection-id="${collection.id}">
                <div class="collection-header">
                    <div class="collection-title-wrapper">
                        <h2 class="collection-title">${escapeHtml(collection.name)}</h2>
                        <span class="collection-count">${collectionPosts.length}</span>
                    </div>
                    ${collection.editable ? `
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
                    ` : ''}
                </div>
                <div class="collection-preview">
                    ${renderCollectionPreview(collectionPosts)}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Превью коллекции (первые 3 картинки)
function renderCollectionPreview(posts) {
    if (posts.length === 0) {
        return '<div class="collection-empty-text">Нет мест в коллекции</div>';
    }
    
    const previewPosts = posts.slice(0, 3);
    return `
        <div class="collection-preview-images">
            ${previewPosts.map(post => `
                <img src="${post.cover_photo || post.image}" class="preview-image" onerror="this.src='https://via.placeholder.com/80x80'">
            `).join('')}
        </div>
    `;
}

// Переключение меню коллекции
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

// Редактирование названия коллекции
window.editCollectionName = function(collectionId) {
    const collection = userCollections.find(c => c.id === collectionId);
    if (!collection || !collection.editable) return;

    const newName = prompt('Введите новое название для коллекции:', collection.name);
    if (newName && newName.trim() !== '') {
        collection.name = newName.trim();
        localStorage.setItem('collections', JSON.stringify(userCollections));
        renderCollectionsList();
    }
};

// Удаление коллекции
window.deleteCollection = function(collectionId) {
    const collection = userCollections.find(c => c.id === collectionId);
    if (!collection || !collection.editable) return;

    if (confirm(`Вы уверены, что хотите удалить коллекцию "${collection.name}"?`)) {
        userCollections = userCollections.filter(c => c.id !== collectionId);
        postCollections = postCollections.filter(pc => pc.collectionId !== collectionId);
        localStorage.setItem('collections', JSON.stringify(userCollections));
        localStorage.setItem('postCollections', JSON.stringify(postCollections));
        renderCollectionsList();
    }
};

// Добавление коллекции
window.addCollection = function() {
    const name = prompt('Введите название новой коллекции:');
    if (name && name.trim()) {
        const newCollection = {
            id: 'custom-' + Date.now(),
            name: name.trim(),
            editable: true
        };
        userCollections.push(newCollection);
        localStorage.setItem('collections', JSON.stringify(userCollections));
        renderCollectionsList();
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

// Инициализация выпадающего меню
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

// Инициализация выхода
function initCollectionsLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Вы уверены, что хотите выйти?')) {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
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
    `;
    document.head.appendChild(styles);
}

document.addEventListener('click', function(event) {
    if (!event.target.closest('.collection-actions-dropdown')) {
        document.querySelectorAll('.collection-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    addCollectionStyles();
    function checkAndRender() {
        if (window.feedPosts && window.feedPosts.length > 0) {
            renderCollectionsList();
            setTimeout(initCollectionClicks, 100);
        } else {
            setTimeout(() => {
                if (window.feedPosts) {
                    renderCollectionsList();
                    initCollectionClicks();
                } else {
                    window.feedPosts = [];
                    renderCollectionsList();
                }
            }, 500);
        }
    }
    
    checkAndRender();
    const addBtn = document.getElementById('addCollectionPageBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.addCollection();
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    initCollectionsTheme();
    initCollectionsDropdown();
    initCollectionsLogout();
});

window.renderCollectionsList = renderCollectionsList;
window.userCollections = userCollections;
window.postCollections = postCollections;