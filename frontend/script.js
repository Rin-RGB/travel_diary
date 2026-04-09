import apiService from './apiService.js';

// Синхронизация коллекций между страницами
let userCollections = JSON.parse(localStorage.getItem('collections')) || [];
let postCollections = JSON.parse(localStorage.getItem('postCollections')) || [];
let currentPostId = null;

if (userCollections.length === 0) {
    userCollections = [
        { id: 'want-to-visit', name: 'Хочу посетить', editable: false },
        { id: 'visited', name: 'Посещено', editable: false }
    ];
    localStorage.setItem('collections', JSON.stringify(userCollections));
}

async function loadFeedFromServer() {
    const feedGrid = document.getElementById('feedGrid');
    if (feedGrid) {
        feedGrid.innerHTML = '<div class="no-posts"><i class="bi bi-hourglass-split"></i><h3>Загрузка...</h3></div>';
    }

    const params = {
        q: filters.search || undefined,
        city: filters.city || undefined,
        tag: filters.tags.length > 0 ? filters.tags.join(',') : undefined
    };

    const posts = await apiService.loadPlaces(params); //тимлид опять (слово, чтобы искать было проще)

    const normalizedPosts = posts.map(post => ({
        id: post.id,
        title: post.name,
        name: post.name,
        city: typeof post.city === 'object' ? post.city?.city || '' : post.city || '',
        description: post.description,
        image: post.cover_photo, 
        cover_photo: post.cover_photo,
        tags: Array.isArray(post.tags) ? post.tags.map(tag => tag.name || tag) : []
    }));


    if (normalizedPosts.length === 0) {
        feedGrid.innerHTML = '<div class="no-posts"><i class="bi bi-search"></i><h3>Ничего не найдено</h3><p>Попробуйте изменить параметры</p></div>';
    } else {
        window.feedPosts = normalizedPosts;
        renderFeed();
    }
    // if (posts.length === 0) {
    //     feedGrid.innerHTML = '<div class="no-posts"><i class="bi bi-search"></i><h3>Ничего не найдено</h3><p>Попробуйте изменить параметры</p></div>';
    // } else {
    //     //window.feedPosts = posts;
    //     window.feedPosts = normalizedPosts; //тимлид
    //     renderFeed();
    // }
}

function escapeHtml(str) { //Это я(даша, которая тимлид) эксперименты ставлю, если забуду удалить - извините
    // Если str не строка и не число, возвращаем пустую строку
    if (str === undefined || str === null) return '';
    // Превращаем в строку, если это число
    const stringValue = String(str);
    return stringValue
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Загрузка городов
async function loadCities() {
    const cities = await apiService.getCities();
    // Обновляем выпадающий список городов
    window.citiesList = cities;
    renderCityDropdown();
}

// Загрузка тегов
// async function loadTags() {
//     const tags = await apiService.getTags();
//     availableTags = tags.map(tag => tag.name || tag);
//     window.tagsList = tags;
// }

async function loadTags() { //тимлид
    const tags = await apiService.getTags();
    window.tagsList = tags;

    // Извлекаем имена тегов из ответа API
    availableTags = tags.map(tag => tag.name || tag);

    // Обновляем дропдаун после загрузки
    renderTagsDropdown();
}


// Функция сохранения постов
function saveFeedPosts() {
    localStorage.setItem('feedPosts', JSON.stringify(window.feedPosts));
}

let filters = {
    search: '',
    city: '',
    tags: []
};

//const availableTags = ['музей', 'театр', 'курорт', 'вулкан', 'водопад', 'гейзер', 'море']; //тимлид закомментил
let availableTags = [];

function getUniqueCities() {
    const cities = window.feedPosts.map(post => post.city);
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
window.selectCity = function (city) {
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
window.removeSelectedTag = function (tag) {
    filters.tags = filters.tags.filter(t => t !== tag);
    renderFeed();
    renderTagsDropdown();
    renderSelectedTags();
};

// Функция для переключения тега из чекбокса
window.toggleTagFromCheckbox = function (tag) {
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

    const filteredPosts = window.feedPosts.filter(post => {
        const matchesSearch = post.name.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCity = !filters.city || post.city === filters.city;
        const matchesTags = filters.tags.length === 0 ||
            filters.tags.some(tag => post.tags.includes(tag));
        return matchesSearch && matchesCity && matchesTags;
    });

    if (filteredPosts.length === 0) {
        feedGrid.innerHTML = `<div class="no-posts"><i class="bi bi-search"></i><h3>Ничего не найдено</h3><p>Попробуйте изменить параметры</p></div>`;
        return;
    }

    // Определяем, является ли пользователь администратором
    const isAdminUser = window.isAdmin && window.isAdmin();
    
    feedGrid.innerHTML = filteredPosts.map(post => `
        <div class="post-card" data-post-id="${post.id}">
            <img src="${post.cover_photo || post.image}" alt="${post.name || post.title}" class="post-image" onerror="this.onerror=null; this.src='https://via.placeholder.com/400x200?text=Фото+не+доступно'">
            <div class="post-content">
                <div class="post-header">
                    <h3 class="post-name">${escapeHtml(post.name)}</h3>
                    ${isAdminUser ? `
                        <div class="post-actions-dropdown">
                            <button class="post-menu-btn" onclick="event.stopPropagation(); togglePostMenu(${post.id})">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <div class="post-menu" id="post-menu-${post.id}">
                                <button onclick="event.stopPropagation(); editPost(${post.id})">
                                    <i class="bi bi-pencil"></i> Редактировать
                                </button>
                                <button onclick="event.stopPropagation(); deletePost(${post.id})">
                                    <i class="bi bi-trash"></i> Удалить
                                </button>
                            </div>
                        </div>
                    ` : ''}
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

    initCardClicks();
}

// Переключение меню поста
function togglePostMenu(postId) {
    const menu = document.getElementById(`post-menu-${postId}`);
    if (!menu) return;

    // Закрываем другие открытые меню
    document.querySelectorAll('.post-menu.show').forEach(openMenu => {
        if (openMenu.id !== `post-menu-${postId}`) {
            openMenu.classList.remove('show');
        }
    });

    menu.classList.toggle('show');
}

// Закрытие меню при клике вне
document.addEventListener('click', function (event) {
    if (!event.target.closest('.post-actions-dropdown')) {
        document.querySelectorAll('.post-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

// Редактирование поста
function editPost(postId) {
    const post = window.feedPosts.find(p => p.id === postId);
    if (!post) return;

    // Создаем модальное окно редактирования
    let modal = document.getElementById('editPostModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editPostModal';
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content" style="max-width: 600px;">
                <div class="auth-modal-header">
                    <h2>Редактирование места</h2>
                    <button class="auth-modal-close" onclick="closeEditPostModal()">✕</button>
                </div>
                <div class="auth-modal-body">
                    <form id="editPostForm">
                        <div class="form-group">
                            <label for="editTitle">Название места *</label>
                            <input type="text" id="editTitle" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label for="editCity">Город *</label>
                            <input type="text" id="editCity" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label for="editAddress">Адрес</label>
                            <input type="text" id="editAddress" class="form-input">
                        </div>
                        <div class="form-group">
                            <label for="editDescription">Описание</label>
                            <textarea id="editDescription" class="form-textarea" rows="4"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="editImageURL">URL изображения</label>
                            <input type="text" id="editImageURL" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Теги</label>
                            <div id="editTags" style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${['музей', 'театр', 'курорт', 'вулкан', 'водопад', 'гейзер', 'море'].map(tag => `
                                    <label style="display: flex; align-items: center; gap: 4px;">
                                        <input type="checkbox" value="${tag}"> #${tag}
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        <button type="submit" class="submit-btn" style="width: 100%; margin-top: 16px;">Сохранить изменения</button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Заполняем форму текущими данными
    document.getElementById('editTitle').value = post.name;
    document.getElementById('editCity').value = post.city;
    document.getElementById('editAddress').value = post.address || '';
    document.getElementById('editDescription').value = post.description;
    document.getElementById('editImageURL').value = post.cover_photo;

    // Отмечаем теги
    const checkboxes = document.querySelectorAll('#editTags input');
    checkboxes.forEach(cb => {
        cb.checked = post.tags.includes(cb.value);
    });

    modal.style.display = 'flex';

    // Сохраняем ID редактируемого поста
    window.editingPostId = postId;

    // Обработчик отправки формы
    const form = document.getElementById('editPostForm');
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('editTitle').value.trim();
        const city = document.getElementById('editCity').value.trim();
        const address = document.getElementById('editAddress').value.trim();
        const description = document.getElementById('editDescription').value.trim();
        let cover_photo = document.getElementById('editImageURL').value.trim();

        if (!name || !city) {
            alert('Пожалуйста, заполните обязательные поля (название и город)');
            return;
        }

        if (!cover_photo) {
            cover_photo = 'https://via.placeholder.com/400x200?text=Новое+место';
        }

        const selectedTags = Array.from(document.querySelectorAll('#editTags input:checked')).map(cb => cb.value);
        if (selectedTags.length === 0) {
            alert('Выберите хотя бы один тег');
            return;
        }

        // Обновляем пост
        const postIndex = window.feedPosts.findIndex(p => p.id === window.editingPostId);
        if (postIndex !== -1) {
            window.feedPosts[postIndex] = {
                ...window.feedPosts[postIndex],
                name: name,
                city: city,
                address: address,
                description: description,
                cover_photo: cover_photo,
                tags: selectedTags
            };

            // Сохраняем в localStorage
            localStorage.setItem('feedPosts', JSON.stringify(window.feedPosts));

            alert('Место успешно обновлено!');
            closeEditPostModal();
            renderFeed();
        }
    });
}

function closeEditPostModal() {
    const modal = document.getElementById('editPostModal');
    if (modal) modal.style.display = 'none';
    window.editingPostId = null;
}

// Удаление поста
function deletePost(postId) {
    if (!confirm('Вы уверены, что хотите удалить это место? Это действие нельзя отменить.')) {
        return;
    }

    const postIndex = window.feedPosts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
        const postTitle = window.feedPosts[postIndex].name;
        window.feedPosts.splice(postIndex, 1);

        // Сохраняем в localStorage
        localStorage.setItem('feedPosts', JSON.stringify(window.feedPosts));

        // Также удаляем пост из всех коллекций
        let postCollections = JSON.parse(localStorage.getItem('postCollections')) || [];
        postCollections = postCollections.filter(pc => pc.postId !== postId);
        localStorage.setItem('postCollections', JSON.stringify(postCollections));

        alert(`Место "${postTitle}" удалено`);
        renderFeed();

        // Если модальное окно открыто с этим постом, закрываем его
        const modal = document.getElementById('postModal');
        if (modal && modal.style.display === 'block') {
            closePostModal();
        }
    }
}

// Инициализация кликов по карточкам
function initCardClicks() {
    const cards = document.querySelectorAll('.post-card');
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.post-actions-dropdown')) return;
            const postId = this.dataset.postId;
            if (postId) {
                openPostModal(postId);
            }
        });
    });
}

function openPostModal(postId) {
    
    const post = window.feedPosts.find(p => p.id === postId);
    if (!post) {
        return;
    }
    
    const modal = document.getElementById('postModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    if (!modal || !modalContent) {
        return;
    }
    
    currentPostId = postId;
    
    if (modalTitle) {
        modalTitle.textContent = post.name || post.title;
    }
    let overlay = document.querySelector('.modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.onclick = closePostModal;
        document.body.appendChild(overlay);
    }
    
    const isAdminUser = window.isAdmin ? window.isAdmin() : false;
    
    modalContent.innerHTML = `
        <img src="${post.cover_photo || post.image}" 
             alt="${post.name || post.title}" 
             style="width:100%; max-height:300px; object-fit:cover; border-radius:16px; margin-bottom:16px;" 
             onerror="this.onerror=null; this.src='https://via.placeholder.com/400x200'">
        <div class="post-city" style="color:var(--accent-color); margin-bottom:8px; font-weight:500;">${post.city || ''}</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
            ${(post.tags || []).map(tag => `<span class="post-tag" data-tag="${tag}">#${tag}</span>`).join('')}
        </div>
        <h4 style="margin-bottom:12px;">Добавить в коллекцию:</h4>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px;" id="collectionButtons"></div>
        <button class="submit-btn" onclick="closePostModal()" style="width:100%;">Закрыть</button>
    `;

    modal.style.display = 'block';
    overlay.style.display = 'block';
    if (typeof renderCollectionButtons === 'function') {
        renderCollectionButtons(postId);
    }
    
    modal.style.display = 'block';
    overlay.style.display = 'block';
}
// Переключение меню в модальном окне
function toggleModalPostMenu(postId) {
    const menu = document.getElementById(`modal-post-menu-${postId}`);
    if (!menu) return;

    document.querySelectorAll('.post-menu.show').forEach(openMenu => {
        if (openMenu.id !== `modal-post-menu-${postId}`) {
            openMenu.classList.remove('show');
        }
    });

    menu.classList.toggle('show');
}

// Закрытие модального окна
function closePostModal() {
    document.getElementById('postModal').style.display = 'none';
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.style.display = 'none';
    currentPostId = null;
}

// Клик по оверлею для закрытия
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-overlay')) {
        closePostModal();
    }
});

function renderCollectionButtons(postId) {
    const container = document.getElementById('collectionButtons');
    if (!container) {
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
    console.log('togglePostInCollection called', postId, collectionId);
    
    let postCollections = JSON.parse(localStorage.getItem('postCollections')) || [];
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

window.removeFromCollection = function (postId, collectionId) {
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

document.addEventListener('DOMContentLoaded', async () => {
    await loadCities();
    await loadTags();
    await loadFeedFromServer();
    initThemeToggle();
    initProfileDropdown();
    initCityDropdown();
    initTagsDropdown();
    initSearch();
    initViewToggle();
    renderSelectedTags();
    
    if (window.updateUIForUser) {
        window.updateUIForUser();
    }
});

window.openPostModal = openPostModal;
window.closePostModal = closePostModal;
window.renderCollectionButtons = renderCollectionButtons;
window.togglePostInCollection = togglePostInCollection;
window.editPost = editPost;
window.deletePost = deletePost;
window.togglePostMenu = togglePostMenu;
window.closeEditPostModal = closeEditPostModal;
window.renderCollectionButtons = renderCollectionButtons;
window.togglePostInCollection = togglePostInCollection;