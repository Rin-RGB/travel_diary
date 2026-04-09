

let currentCollectionId = null;
let currentCollection = null;
let currentViewMode = 'grid';
let currentCollectionPosts = [];

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

// Инициализация страницы коллекции
function initCollectionDetail() {
    console.log('initCollectionDetail вызвана');
    const urlParams = new URLSearchParams(window.location.search);
    currentCollectionId = urlParams.get('id');
    
    console.log('ID коллекции из URL:', currentCollectionId);
    
    if (!currentCollectionId) {
        console.error('ID коллекции не найден в URL');
        window.location.href = 'collections.html';
        return;
    }
    
    const collections = JSON.parse(localStorage.getItem('collections')) || [];
    currentCollection = collections.find(c => c.id === currentCollectionId);
    
    if (!currentCollection) {
        console.error('Коллекция не найдена');
        window.location.href = 'collections.html';
        return;
    }
    
    const titleElement = document.getElementById('collectionTitle');
    if (titleElement) {
        titleElement.textContent = escapeHtml(currentCollection.name);
    }
    
    loadCollectionPosts();
    
    // Инициализируем общие функции
    initCollectionThemeToggle();
    initCollectionProfileDropdown();
    initCollectionLogout();
}

// Загрузка постов коллекции
function loadCollectionPosts() {
    console.log('loadCollectionPosts вызвана');
    
    if (!window.feedPosts) {
        console.error('window.feedPosts не определен!');
        const feedGrid = document.getElementById('feedGrid');
        if (feedGrid) {
            feedGrid.innerHTML = '<div class="no-posts"><i class="bi bi-exclamation-triangle"></i><h3>Ошибка загрузки</h3><p>Данные о местах не найдены</p></div>';
        }
        return;
    }
    
    console.log('window.feedPosts доступен, количество постов:', window.feedPosts.length);
    
    const postCollections = JSON.parse(localStorage.getItem('postCollections')) || [];
    console.log('postCollections из localStorage:', postCollections);
    
    const postIds = postCollections
        .filter(pc => pc.collectionId === currentCollectionId)
        .map(pc => pc.postId);
    
    console.log('Найденные ID постов в коллекции:', postIds);
    
    currentCollectionPosts = window.feedPosts.filter(post => postIds.includes(post.id));
    
    console.log('Загружено постов в коллекции:', currentCollectionPosts.length);
    console.log('Посты в коллекции:', currentCollectionPosts);
    
    renderCollectionFeed();
}

// Рендер ленты коллекции
function renderCollectionFeed() {
    const feedGrid = document.getElementById('feedGrid');
    if (!feedGrid) {
        console.error('Элемент feedGrid не найден');
        return;
    }
    
    console.log('renderCollectionFeed, количество постов для отображения:', currentCollectionPosts.length);
    
    feedGrid.className = `feed-grid ${currentViewMode}-view`;
    
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const selectedCity = window.currentCityFilter || '';
    const selectedTags = window.currentTagFilters || [];
    
    let filteredPosts = [...currentCollectionPosts];
    
    if (searchTerm) {
        filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm)
        );
    }
    
    if (selectedCity) {
        filteredPosts = filteredPosts.filter(post => post.city === selectedCity);
    }
    
    if (selectedTags.length > 0) {
        filteredPosts = filteredPosts.filter(post => 
            selectedTags.some(tag => post.tags.includes(tag))
        );
    }
    
    console.log('Отфильтровано постов:', filteredPosts.length);
    
    if (filteredPosts.length === 0) {
        if (currentCollectionPosts.length === 0) {
            feedGrid.innerHTML = `<div class="no-posts"><i class="bi bi-folder"></i><h3>Коллекция пуста</h3><p>Добавьте места из ленты, чтобы они появились здесь</p><a href="index.html" class="browse-link">Перейти к ленте →</a></div>`;
        } else {
            feedGrid.innerHTML = `<div class="no-posts"><i class="bi bi-search"></i><h3>Ничего не найдено</h3><p>Попробуйте изменить параметры фильтрации</p></div>`;
        }
        return;
    }
    
    feedGrid.innerHTML = filteredPosts.map(post => `
        <div class="post-card" data-post-id="${post.id}">
            <img src="${post.image}" alt="${escapeHtml(post.title)}" class="post-image" onerror="this.src='https://via.placeholder.com/400x200?text=Фото+не+доступно'">
            <div class="post-content">
                <div class="post-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h3 class="post-title">${escapeHtml(post.title)}</h3>
                    <div class="post-actions-dropdown">
                        <button class="post-menu-btn" onclick="event.stopPropagation(); togglePostMenu(${post.id})">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <div class="post-menu" id="post-menu-${post.id}">
                            <button onclick="event.stopPropagation(); removeFromCollectionDetail(${post.id})" class="remove-menu-item">
                                <i class="bi bi-trash"></i> Удалить из коллекции
                            </button>
                        </div>
                    </div>
                </div>
                <div class="post-city">${escapeHtml(post.city)}${post.address ? `, ${escapeHtml(post.address)}` : ''}</div>
                <p class="post-description">${escapeHtml(post.description)}</p>
                <div class="post-footer">
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="post-tag" data-tag="${tag}">#${escapeHtml(tag)}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    initCollectionCardClicks();
}

// Инициализация кликов по карточкам
function initCollectionCardClicks() {
    const cards = document.querySelectorAll('.post-card');
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.post-actions-dropdown')) {
                return;
            }
            const postId = this.dataset.postId;
            if (postId) {
                if (typeof openPostModal === 'function') {
                    openPostModal(parseInt(postId));
                } else {
                    console.error('openPostModal не определена');
                    alert('Функция открытия модального окна недоступна');
                }
            }
        });
    });
}

// Удаление поста из коллекции
window.removeFromCollectionDetail = function(postId) {
    if (confirm('Вы уверены, что хотите удалить это место из коллекции?')) {
        let postCollections = JSON.parse(localStorage.getItem('postCollections')) || [];
        postCollections = postCollections.filter(pc => 
            !(pc.postId === postId && pc.collectionId === currentCollectionId)
        );
        localStorage.setItem('postCollections', JSON.stringify(postCollections));
        
        console.log('Пост удален из коллекции, загружаем обновленный список');
        loadCollectionPosts();
    }
};

// Переключение меню поста
window.togglePostMenu = function(postId) {
    const menu = document.getElementById(`post-menu-${postId}`);
    if (!menu) return;
    
    document.querySelectorAll('.post-menu.show').forEach(openMenu => {
        if (openMenu.id !== `post-menu-${postId}`) {
            openMenu.classList.remove('show');
        }
    });
    
    menu.classList.toggle('show');
};

// Закрытие меню при клике вне
document.addEventListener('click', function(event) {
    if (!event.target.closest('.post-actions-dropdown')) {
        document.querySelectorAll('.post-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

// Фильтр по городам
window.currentCityFilter = '';
window.currentTagFilters = [];

function initCollectionCityFilter() {
    const cityToggle = document.getElementById('cityToggleBtn');
    const cityDropdown = document.getElementById('cityDropdown');
    const closeBtn = document.getElementById('closeCityDropdown');
    const selectedDisplay = document.getElementById('selectedCityDisplay');
    
    if (!cityToggle || !cityDropdown) {
        console.log('Элементы фильтра города не найдены');
        return;
    }
    
    function renderCityDropdownContent() {
        const dropdownContent = document.getElementById('cityDropdownContent');
        if (!dropdownContent) return;
        
        const cities = [...new Set(currentCollectionPosts.map(post => post.city))];
        
        let html = `<div class="city-item ${!window.currentCityFilter ? 'selected' : ''}" onclick="selectCollectionCity('')"><i class="bi bi-globe"></i><span>Все города</span></div>`;
        cities.sort().forEach(city => {
            html += `<div class="city-item ${window.currentCityFilter === city ? 'selected' : ''}" onclick="selectCollectionCity('${city.replace(/'/g, "\\'")}')"><i class="bi bi-geo-alt"></i><span>${escapeHtml(city)}</span></div>`;
        });
        
        dropdownContent.innerHTML = html;
        if (selectedDisplay) {
            selectedDisplay.textContent = window.currentCityFilter || 'Все города';
        }
    }
    
    window.selectCollectionCity = function(city) {
        window.currentCityFilter = city;
        renderCityDropdownContent();
        renderCollectionFeed();
        if (cityDropdown) cityDropdown.classList.remove('show');
    };
    
    const newCityToggle = cityToggle.cloneNode(true);
    cityToggle.parentNode.replaceChild(newCityToggle, cityToggle);
    
    newCityToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        renderCityDropdownContent();
        if (cityDropdown) cityDropdown.classList.toggle('show');
    });
    
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', () => {
            if (cityDropdown) cityDropdown.classList.remove('show');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (cityDropdown && !newCityToggle.contains(e.target) && !cityDropdown.contains(e.target)) {
            cityDropdown.classList.remove('show');
        }
    });
}

// Инициализация фильтра по тегам
function initCollectionTagsFilter() {
    const tagsToggle = document.getElementById('tagsToggleBtn');
    const tagsDropdown = document.getElementById('tagsDropdown');
    const closeBtn = document.getElementById('closeTagsDropdown');
    const selectedTagsContainer = document.getElementById('selectedTagsContainer');
    
    if (!tagsToggle || !tagsDropdown) {
        console.log('Элементы фильтра тегов не найдены');
        return;
    }
    
    const availableTags = ['музей', 'театр', 'курорт', 'вулкан', 'водопад', 'гейзер', 'море'];
    
    function renderTagsDropdownContent() {
        const dropdownContent = document.getElementById('tagsDropdownContent');
        if (!dropdownContent) return;
        
        let html = '';
        availableTags.forEach(tag => {
            const checked = window.currentTagFilters.includes(tag) ? 'checked' : '';
            html += `<label class="tag-checkbox-item"><input type="checkbox" value="${tag}" ${checked} onchange="toggleCollectionTag('${tag}')"><span>#${tag}</span><span class="tag-color-indicator" style="background: var(--tag-${getTagColorIndex(tag)})"></span></label>`;
        });
        dropdownContent.innerHTML = html;
    }
    
    function renderSelectedTags() {
        if (!selectedTagsContainer) return;
        selectedTagsContainer.innerHTML = '';
        
        if (window.currentTagFilters.length > 0) {
            window.currentTagFilters.forEach(tag => {
                const tagColor = getTagColorIndex(tag);
                const tagSpan = document.createElement('span');
                tagSpan.className = 'selected-tag';
                tagSpan.style.backgroundColor = `var(--tag-${tagColor})`;
                tagSpan.innerHTML = `#${tag} <span class="remove-tag" onclick="removeCollectionTag('${tag}')">✕</span>`;
                selectedTagsContainer.appendChild(tagSpan);
            });
            selectedTagsContainer.classList.add('has-tags');
        } else {
            selectedTagsContainer.classList.remove('has-tags');
        }
    }
    
    window.toggleCollectionTag = function(tag) {
        if (window.currentTagFilters.includes(tag)) {
            window.currentTagFilters = window.currentTagFilters.filter(t => t !== tag);
        } else {
            window.currentTagFilters.push(tag);
        }
        renderTagsDropdownContent();
        renderSelectedTags();
        renderCollectionFeed();
    };
    
    window.removeCollectionTag = function(tag) {
        window.currentTagFilters = window.currentTagFilters.filter(t => t !== tag);
        renderTagsDropdownContent();
        renderSelectedTags();
        renderCollectionFeed();
    };

    const newTagsToggle = tagsToggle.cloneNode(true);
    tagsToggle.parentNode.replaceChild(newTagsToggle, tagsToggle);
    
    newTagsToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        renderTagsDropdownContent();
        tagsDropdown.classList.toggle('show');
    });
    
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', () => tagsDropdown.classList.remove('show'));
    }
    
    document.addEventListener('click', (e) => {
        if (!newTagsToggle.contains(e.target) && !tagsDropdown.contains(e.target)) {
            tagsDropdown.classList.remove('show');
        }
    });
    
    renderSelectedTags();
}

// Инициализация переключения вида
function initCollectionViewToggle() {
    const gridBtn = document.getElementById('viewGrid');
    const listBtn = document.getElementById('viewList');
    const feedGrid = document.getElementById('feedGrid');
    
    if (!gridBtn || !listBtn || !feedGrid) {
        console.log('Элементы переключения вида не найдены');
        return;
    }
    
    const newGridBtn = gridBtn.cloneNode(true);
    const newListBtn = listBtn.cloneNode(true);
    gridBtn.parentNode.replaceChild(newGridBtn, gridBtn);
    listBtn.parentNode.replaceChild(newListBtn, listBtn);
    
    newGridBtn.addEventListener('click', () => {
        currentViewMode = 'grid';
        feedGrid.classList.remove('list-view');
        feedGrid.classList.add('grid-view');
        newGridBtn.classList.add('active');
        newListBtn.classList.remove('active');
        renderCollectionFeed();
    });
    
    newListBtn.addEventListener('click', () => {
        currentViewMode = 'list';
        feedGrid.classList.remove('grid-view');
        feedGrid.classList.add('list-view');
        newListBtn.classList.add('active');
        newGridBtn.classList.remove('active');
        renderCollectionFeed();
    });
}

// Инициализация поиска
function initCollectionSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const newSearchInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearchInput, searchInput);
        
        newSearchInput.addEventListener('input', () => {
            renderCollectionFeed();
        });
    }
}

// Инициализация переключения темы
function initCollectionThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) {
        return;
    }
    
    const icon = themeToggle.querySelector('i');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (icon) {
            icon.classList.remove('bi-moon');
            icon.classList.add('bi-sun');
        }
    }
    const newToggle = themeToggle.cloneNode(true);
    themeToggle.parentNode.replaceChild(newToggle, themeToggle);
    
    newToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const html = document.documentElement;
        const iconNew = newToggle.querySelector('i');
        
        if (html.hasAttribute('data-theme')) {
            html.removeAttribute('data-theme');
            if (iconNew) {
                iconNew.classList.remove('bi-sun');
                iconNew.classList.add('bi-moon');
            }
            localStorage.setItem('theme', 'light');
        } else {
            html.setAttribute('data-theme', 'dark');
            if (iconNew) {
                iconNew.classList.remove('bi-moon');
                iconNew.classList.add('bi-sun');
            }
            localStorage.setItem('theme', 'dark');
        }
    });
}

// Инициализация выпадающего меню профиля
function initCollectionProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const dropdown = document.getElementById('dropdownMenu');
    
    if (!profileBtn || !dropdown) {
        return;
    }
    const newProfileBtn = profileBtn.cloneNode(true);
    profileBtn.parentNode.replaceChild(newProfileBtn, profileBtn);
    
    newProfileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle('show');
        console.log('Dropdown toggled:', dropdown.classList.contains('show'));
    });
    document.addEventListener('click', (e) => {
        if (!newProfileBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

// Инициализация выхода
function initCollectionLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
        newLogoutBtn.addEventListener('click', (e) => {
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

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, инициализация collection_detail');
    initCollectionDetail();
    initCollectionCityFilter();
    initCollectionTagsFilter();
    initCollectionSearch();
    initCollectionViewToggle();
    initCollectionThemeToggle();
    initCollectionProfileDropdown();
    initCollectionLogout();     
});