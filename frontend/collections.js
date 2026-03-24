console.log('collections.js загружен');

const collectionsFeedPosts = window.feedPosts || [
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

// Функция рендеринга списка коллекций
function renderCollectionsList() {
    const container = document.getElementById('collectionsList');
    if (!container) {
        console.error('Контейнер collectionsList не найден!');
        return;
    }

    let html = '';
    window.userCollections.forEach(collection => {
        const postIds = (window.postCollections || [])
            .filter(pc => pc.collectionId === collection.id)
            .map(pc => pc.postId);
        const posts = collectionsFeedPosts.filter(post => postIds.includes(post.id));

        html += `
            <div class="collection-card" data-collection-id="${collection.id}">
                <div class="collection-header">
                    <div class="collection-title-wrapper">
                        <h2 class="collection-title">${escapeHtml(collection.name)}</h2>
                        <span class="collection-count">${posts.length}</span>
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

                <div class="collection-posts">
                    ${posts.length > 0 ? `
                        <div class="collection-posts-list">
                            ${posts.map(post => `
                                <div class="collection-post-item">
                                    <img src="${post.image}" alt="${escapeHtml(post.title)}" class="collection-post-image" onerror="this.src='https://via.placeholder.com/80x80?text=Фото'">
                                    <div class="collection-post-info">
                                        <h4 class="collection-post-title">${escapeHtml(post.title)}</h4>
                                        <div class="collection-post-meta">
                                            <span>${escapeHtml(post.city)}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="collection-empty">
                            <p>В этой коллекции пока нет мест</p>
                        </div>
                    `}
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

// Функция для экранирования HTML (безопасность)
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация collections');
    renderCollectionsList();
    
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