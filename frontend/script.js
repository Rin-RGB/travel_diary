// Мок-данные для ленты 
const feedPosts = [
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

// Синхронизация коллекций между страницами
let userCollections = JSON.parse(localStorage.getItem('collections')) || [];
let postCollections = JSON.parse(localStorage.getItem('postCollections')) || [];

if (userCollections.length === 0) {
    userCollections = [
        { id: 'want-to-visit', name: 'Хочу посетить', editable: false },
        { id: 'visited', name: 'Посещено', editable: false }
    ];
    localStorage.setItem('collections', JSON.stringify(userCollections));
}

let filters = {
    search: '',
    city: '',
    tags: []
};

const availableTags = ['музей', 'театр', 'курорт', 'вулкан', 'водопад', 'гейзер', 'море'];

function getUniqueCities() {
    const cities = feedPosts.map(post => post.city);
    return [...new Set(cities)];
}

// Рендер выпадающего списка городов
function renderCityDropdown() {
    const dropdownContent = document.getElementById('cityDropdownContent');
    const selectedDisplay = document.getElementById('selectedCityDisplay');
    if (!dropdownContent || !selectedDisplay) return;
    
    const cities = getUniqueCities();
    
    let html = `
        <div class="city-item ${!filters.city ? 'selected' : ''}" onclick="selectCity('')">
            <i class="bi bi-globe"></i>
            <span>Все города</span>
        </div>
    `;
    
    cities.sort().forEach(city => {
        const selectedClass = filters.city === city ? 'selected' : '';
        html += `
            <div class="city-item ${selectedClass}" onclick="selectCity('${city}')">
                <i class="bi bi-geo-alt"></i>
                <span>${city}</span>
            </div>
        `;
    });
    
    dropdownContent.innerHTML = html;
    selectedDisplay.textContent = filters.city || 'Все города';
}

// Функция выбора города
window.selectCity = function(city) {
    filters.city = city;
    renderCityDropdown();
    renderFeed();

    document.getElementById('cityDropdown').classList.remove('show');
};

// Функция для рендера чекбоксов тегов
function renderTagsDropdown() {
    const dropdownContent = document.getElementById('tagsDropdownContent');
    if (!dropdownContent) return;
    
    let html = '';
    availableTags.forEach(tag => {
        const checked = filters.tags.includes(tag) ? 'checked' : '';
        html += `
            <label class="tag-checkbox-item">
                <input type="checkbox" value="${tag}" ${checked} onchange="toggleTagFromCheckbox('${tag}')">
                <span>#${tag}</span>
                <span class="tag-color-indicator" style="background: var(--tag-${getTagColorIndex(tag)})"></span>
            </label>
        `;
    });
    dropdownContent.innerHTML = html;
}

// Отображение выбранных тегов над карточками
function renderSelectedTags() {
    const tagsContainer = document.getElementById('selectedTagsContainer');
    if (!tagsContainer) return;
    
    tagsContainer.innerHTML = '';

    if (filters.tags.length > 0) {
        filters.tags.forEach(tag => {
            const tagColor = getTagColorIndex(tag);
            const tagSpan = document.createElement('span');
            tagSpan.className = 'selected-tag';
            tagSpan.setAttribute('data-tag', tag);
            tagSpan.style.backgroundColor = `var(--tag-${tagColor})`;
            tagSpan.innerHTML = `#${tag} <span class="remove-tag" onclick="removeSelectedTag('${tag}')">✕</span>`;
            tagsContainer.appendChild(tagSpan);
        });
        tagsContainer.classList.add('has-tags');
    } else {
        tagsContainer.classList.remove('has-tags');
    }
}

// Удаление тега по клику на крестик
window.removeSelectedTag = function(tag) {
    filters.tags = filters.tags.filter(t => t !== tag);
    renderFeed();
    renderTagsDropdown();
    renderSelectedTags();
};

// Функция для переключения тега из чекбокса
window.toggleTagFromCheckbox = function(tag) {
    if (filters.tags.includes(tag)) {
        filters.tags = filters.tags.filter(t => t !== tag);
    } else {
        filters.tags.push(tag);
    }
    renderFeed();
    renderTagsDropdown();
    renderSelectedTags();
};

// Функция для определения цвета тега
function getTagColorIndex(tag) {
    const colorMap = {
        'музей': 1,
        'театр': 2,
        'курорт': 3,
        'вулкан': 4,
        'водопад': 5
    };
    return colorMap[tag] || 'default';
}
let viewMode = 'grid'; 

// Функция переключения вида
function initViewToggle() {
    const gridBtn = document.getElementById('viewGrid');
    const listBtn = document.getElementById('viewList');
    const feedGrid = document.getElementById('feedGrid');
    
    if (!gridBtn || !listBtn || !feedGrid) return;
    
    gridBtn.addEventListener('click', () => {
        viewMode = 'grid';
        feedGrid.classList.remove('list-view');
        feedGrid.classList.add('grid-view');
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
        renderFeed(); 
    });
    
    listBtn.addEventListener('click', () => {
        viewMode = 'list';
        feedGrid.classList.remove('grid-view');
        feedGrid.classList.add('list-view');
        listBtn.classList.add('active');
        gridBtn.classList.remove('active');
        renderFeed();
    });
}

// Лента
function renderFeed() {
    const feedGrid = document.getElementById('feedGrid');
    if (!feedGrid) return;

    feedGrid.className = `feed-grid ${viewMode}-view`;

    const filteredPosts = feedPosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCity = !filters.city || post.city === filters.city;
        const matchesTags = filters.tags.length === 0 || 
            filters.tags.some(tag => post.tags.includes(tag));
        return matchesSearch && matchesCity && matchesTags;
    });


    if (filteredPosts.length === 0) {
        feedGrid.innerHTML = `<div class="no-posts"><i class="bi bi-search"></i><h3>Ничего не найдено</h3><p>Попробуйте изменить параметры</p></div>`;
        return;
    }

    feedGrid.innerHTML = filteredPosts.map(post => `
        <div class="post-card" data-post-id="${post.id}">
            <img src="${post.image}" alt="${post.title}" class="post-image" onerror="this.src='https://via.placeholder.com/400x200?text=Фото+не+доступно'">
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <div class="post-city">${post.city}${post.address ? `, ${post.address}` : ''}</div>
                <p class="post-description">${post.description}</p>
                <div class="post-footer">
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="post-tag" data-tag="${tag}">#${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    initCardClicks();
}    

// Инициализация кликов по карточкам
function initCardClicks() {
    const cards = document.querySelectorAll('.post-card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const postId = this.dataset.postId;
            if (postId) {
                openPostModal(parseInt(postId));
            }
        });
    });
}

// Открытие модального окна
function openPostModal(postId) {
    const post = feedPosts.find(p => p.id === postId);
    if (!post) return;
    
    currentPostId = postId;
    
    const modal = document.getElementById('postModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    if (modalTitle) {
        modalTitle.textContent = post.title;
    }
    
    // Оверлей
    let overlay = document.querySelector('.modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
    }
    
    // Контент модального окна
    modalContent.innerHTML = `
        <img src="${post.image}" alt="${post.title}" style="width:100%; max-height:300px; object-fit:cover; border-radius:16px; margin-bottom:16px;">
        <div class="post-city" style="color:var(--accent-color); margin-bottom:8px; font-weight:500;">${post.city}</div>
        <p style="margin-bottom:16px;">${post.description}</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
            ${post.tags.map(tag => `<span class="post-tag" data-tag="${tag}">#${tag}</span>`).join('')}
        </div>
        
        <h4 style="margin-bottom:12px;">Добавить в коллекцию:</h4>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px;" id="collectionButtons"></div>
    `;
    
    renderCollectionButtons(postId);
    
    modal.style.display = 'block';
    overlay.style.display = 'block';
}

// Закрытие модального окна
function closePostModal() {
    document.getElementById('postModal').style.display = 'none';
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.style.display = 'none';
    currentPostId = null;
}

// Клик по оверлею для закрытия
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closePostModal();
    }
});

function renderCollectionButtons(postId) {
    const container = document.getElementById('collectionButtons');
    if (!container) {
        console.error('collectionButtons not found!');
        return;
    }
    
    const postInCollections = postCollections.filter(pc => pc.postId === postId).map(pc => pc.collectionId);
    
    let html = '';
    userCollections.forEach(collection => {
        const isActive = postInCollections.includes(collection.id);
        html += `<button class="collection-btn ${isActive ? 'active' : ''}" onclick="togglePostInCollection(${postId}, '${collection.id}')">${collection.name}</button>`;
    });
    
    container.innerHTML = html;
}

// Переключение поста в коллекции
window.togglePostInCollection = function(postId, collectionId) { 
    
    const index = postCollections.findIndex(pc => pc.postId === postId && pc.collectionId === collectionId);
    
    if (index === -1) {
        postCollections.push({ postId, collectionId });
    } else {
        postCollections.splice(index, 1);
    }
    
    localStorage.setItem('postCollections', JSON.stringify(postCollections));

    if (currentPostId === postId) {
        renderCollectionButtons(postId);
    }
};

// Переключение темы
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.classList.remove('bi-moon');
        icon.classList.add('bi-sun');
    }
    themeToggle.addEventListener('click', () => {
        const html = document.documentElement;
        if (html.hasAttribute('data-theme')) {
            html.removeAttribute('data-theme');
            icon.classList.remove('bi-sun');
            icon.classList.add('bi-moon');
            localStorage.setItem('theme', 'light');
        } else {
            html.setAttribute('data-theme', 'dark');
            icon.classList.remove('bi-moon');
            icon.classList.add('bi-sun');
            localStorage.setItem('theme', 'dark');
        }
    });
}

// Выпадающее меню профиля
function initProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const dropdown = document.getElementById('dropdownMenu');
    if (!profileBtn || !dropdown) return;

    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

// Фильтр города
function initCityDropdown() {
    const cityToggle = document.getElementById('cityToggleBtn');
    const cityDropdown = document.getElementById('cityDropdown');
    const closeBtn = document.getElementById('closeCityDropdown');
    
    if (!cityToggle || !cityDropdown) return;
    
    cityToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        cityDropdown.classList.toggle('show');
        renderCityDropdown(); 
    });
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            cityDropdown.classList.remove('show');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (!cityToggle.contains(e.target) && !cityDropdown.contains(e.target)) {
            cityDropdown.classList.remove('show');
        }
    });
}

// Фильтр по тегам
function initTagsDropdown() {
    const tagsToggle = document.getElementById('tagsToggleBtn');
    const tagsDropdown = document.getElementById('tagsDropdown');
    const closeBtn = document.getElementById('closeTagsDropdown');
    
    if (!tagsToggle || !tagsDropdown) return;
    
    tagsToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        tagsDropdown.classList.toggle('show');
        renderTagsDropdown(); 
    });
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            tagsDropdown.classList.remove('show');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (!tagsToggle.contains(e.target) && !tagsDropdown.contains(e.target)) {
            tagsDropdown.classList.remove('show');
        }
    });
}

// Поиск
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    searchInput.addEventListener('input', (e) => {
        filters.search = e.target.value;
        renderFeed();
    });
}

// Выход
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Вы уверены, что хотите выйти?')) {
                alert('Выход из аккаунта');
            }
        });
    }
}

window.removeFromCollection = function(postId, collectionId) {
    let postCollections = JSON.parse(localStorage.getItem('postCollections')) || [];
    postCollections = postCollections.filter(pc => 
        !(pc.postId === postId && pc.collectionId === collectionId)
    );
    localStorage.setItem('postCollections', JSON.stringify(postCollections));
    
    if (window.location.pathname.includes('collection_detail.html')) {
        if (typeof loadCollectionPosts === 'function') {
            loadCollectionPosts();
        }
    }
    
    if (currentPostId === postId) {
        renderCollectionButtons(postId);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    renderCityDropdown();
    renderFeed();
    initThemeToggle();
    initProfileDropdown();
    initCityDropdown();
    initTagsDropdown();
    initSearch();
    initLogout();
    initViewToggle(); 
    renderSelectedTags();
});