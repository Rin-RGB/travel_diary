import apiService from './apiService.js';

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

// Загружаем коллекции
window.userCollections = JSON.parse(localStorage.getItem('collections')) || [
    { id: 'want-to-visit', name: 'Хочу посетить', editable: false },
    { id: 'visited', name: 'Посещено', editable: false }
];

window.postCollections = JSON.parse(localStorage.getItem('postCollections')) || [];

// Сохраняем начальные коллекции, если их нет
if (JSON.parse(localStorage.getItem('collections')) === null) {
    localStorage.setItem('collections', JSON.stringify(window.userCollections));
}

// Функция получения постов (ждет загрузки window.feedPosts)
function getFeedPosts() {
    return window.feedPosts || [];
}

// Функция рендеринга списка коллекций
function renderCollectionsList() {
    const container = document.getElementById('collectionsList');
    if (!container) {
        console.error('Контейнер collectionsList не найден!');
        return;
    }

    const posts = getFeedPosts();
    console.log('Постов для отображения:', posts.length);

    let html = '';
    window.userCollections.forEach(collection => {
        const postIds = (window.postCollections || [])
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
            </div>
        `;
    });
    container.innerHTML = html;
    
    // Добавляем обработчики кликов на карточки коллекций
    document.querySelectorAll('.collection-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Проверяем, что клик не по кнопкам меню
            if (!e.target.closest('.collection-actions-dropdown')) {
                const collectionId = this.dataset.collectionId;
                if (collectionId) {
                    openCollectionDetail(collectionId);
                }
            }
        });
    });
}

// Функция открытия детальной страницы коллекции
window.openCollectionDetail = function(collectionId) {
    console.log('Открываем коллекцию:', collectionId);
    window.location.href = `collection_detail.html?id=${collectionId}`;
};

// Функция для переключения видимости меню 
window.toggleCollectionMenu = function(collectionId) {
    const menu = document.getElementById(`menu-${collectionId}`);
    if (!menu) return;
    
    // Закрываем другие открытые меню
    document.querySelectorAll('.collection-menu.show').forEach(openMenu => {
        if (openMenu.id !== `menu-${collectionId}`) {
            openMenu.classList.remove('show');
        }
    });
    
    menu.classList.toggle('show');
};

// Закрыть меню при клике вне его
document.addEventListener('click', function(event) {
    if (!event.target.closest('.collection-actions-dropdown')) {
        document.querySelectorAll('.collection-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

// Функция для редактирования названия коллекции
window.editCollectionName = function(collectionId) {
    const collection = window.userCollections.find(c => c.id === collectionId);
    if (!collection || !collection.editable) return;

    const newName = prompt('Введите новое название для коллекции:', collection.name);
    if (newName && newName.trim() !== '') {
        collection.name = newName.trim();
        localStorage.setItem('collections', JSON.stringify(window.userCollections));
        renderCollectionsList(); 
    }
};

// Функция удаления коллекции
window.deleteCollection = function(collectionId) {
    const collection = window.userCollections.find(c => c.id === collectionId);
    if (!collection || !collection.editable) return;

    if (confirm(`Вы уверены, что хотите удалить коллекцию "${collection.name}"? Посты из неё не удалятся, но связь с ними потеряется.`)) {
        window.userCollections = window.userCollections.filter(c => c.id !== collectionId);
        window.postCollections = window.postCollections.filter(pc => pc.collectionId !== collectionId);
        localStorage.setItem('collections', JSON.stringify(window.userCollections));
        localStorage.setItem('postCollections', JSON.stringify(window.postCollections));
        renderCollectionsList();
    }
};

// Функция добавления коллекции
window.addCollection = function() {
    console.log('addCollection вызвана');
    const name = prompt('Введите название новой коллекции:');
    console.log('Введенное имя:', name);
    if (name && name.trim()) {
        const newCollection = {
            id: 'custom-' + Date.now(),
            name: name.trim(),
            editable: true
        };
        window.userCollections.push(newCollection);
        localStorage.setItem('collections', JSON.stringify(window.userCollections));
        console.log('Коллекция добавлена:', newCollection);
        renderCollectionsList();
    } else {
        console.log('Добавление отменено');
    }
};

// Добавляем стили для превью коллекций
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
    `;
    document.head.appendChild(styles);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация collections');
    addCollectionStyles();
    
    // Ждем загрузки window.feedPosts
    function checkAndRender() {
        if (window.feedPosts && window.feedPosts.length > 0) {
            renderCollectionsList();
        } else {
            // Если посты еще не загружены, ждем немного и пробуем снова
            setTimeout(() => {
                if (window.feedPosts) {
                    renderCollectionsList();
                } else {
                    console.warn('Посты не загружены, создаем пустой массив');
                    window.feedPosts = [];
                    renderCollectionsList();
                }
            }, 100);
        }
    }
    
    checkAndRender();
    
    const addBtn = document.getElementById('addCollectionPageBtn');
    if (addBtn) {
        console.log('Кнопка "Новая коллекция" найдена');
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Кнопка нажата');
            window.addCollection();
        });
    } else {
        console.error('Кнопка "Новая коллекция" не найдена');
    }
});