import apiService from './apiService.js';

let currentPosts = [];
let currentPostId = null;
let viewMode = 'grid';
let isAdminUser = false;

let filters = {
    search: '',
    city: '',
    tags: []
};

let availableTags = [];

function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function loadAndRenderFeed() {
    const feedGrid = document.getElementById('feedGrid');
    if (feedGrid) {
        feedGrid.innerHTML = '<div class="no-posts"><i class="bi bi-hourglass-split"></i><h3>Загрузка...</h3></div>';
    }
    
    const params = {
        q: filters.search || undefined,
        city: filters.city || undefined,
        tag: filters.tags.length > 0 ? filters.tags.join(',') : undefined
    };
    
    const posts = await apiService.loadPlaces(params);
    
    currentPosts = posts.map(post => ({
        ...post,
        city: typeof post.city === 'object' && post.city !== null ? post.city.city || '' : (post.city || ''),
        name: post.name || post.title,
        cover_photo: post.cover_photo || post.image,
        tags: Array.isArray(post.tags) ? post.tags.map(tag => tag.name || tag) : []
    }));
    
    if (currentPosts.length === 0) {
        feedGrid.innerHTML = '<div class="no-posts"><i class="bi bi-search"></i><h3>Ничего не найдено</h3><p>Попробуйте изменить параметры</p></div>';
    } else {
        renderFeed();
    }
}

async function loadCities() {
    const cities = await apiService.getCities();
    window.citiesList = cities;
}

async function loadTags() {
    const tags = await apiService.getTags();
    availableTags = tags.map(tag => tag.name || tag);
    renderTagsDropdown();
}

async function updateAdminStatus() {
    if (window.isAdmin) {
        isAdminUser = await window.isAdmin();
    }
}

function getTagColorIndex(tag) {
    return 'default';
}

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

function renderSelectedTags() {
    const tagsContainer = document.getElementById('selectedTagsContainer');
    if (!tagsContainer) return;
    
    tagsContainer.innerHTML = '';
    
    if (filters.tags.length > 0) {
        filters.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'selected-tag';
            tagSpan.style.backgroundColor = `var(--tag-${getTagColorIndex(tag)})`;
            tagSpan.innerHTML = `#${tag} <span class="remove-tag" onclick="removeSelectedTag('${tag}')">✕</span>`;
            tagsContainer.appendChild(tagSpan);
        });
        tagsContainer.classList.add('has-tags');
    } else {
        tagsContainer.classList.remove('has-tags');
    }
}

window.removeSelectedTag = function(tag) {
    filters.tags = filters.tags.filter(t => t !== tag);
    renderFeed();
    renderTagsDropdown();
    renderSelectedTags();
};

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

function getUniqueCities() {
    const cities = currentPosts.map(post => post.city).filter(city => city);
    return [...new Set(cities)];
}

function renderCityDropdown() {
    const dropdownContent = document.getElementById('cityDropdownContent');
    const selectedDisplay = document.getElementById('selectedCityDisplay');
    if (!dropdownContent || !selectedDisplay) return;
    
    const cities = getUniqueCities();
    
    let html = `<div class="city-item ${!filters.city ? 'selected' : ''}" onclick="selectCity('')"><i class="bi bi-globe"></i><span>Все города</span></div>`;
    
    cities.sort().forEach(city => {
        html += `<div class="city-item ${filters.city === city ? 'selected' : ''}" onclick="selectCity('${city.replace(/'/g, "\\'")}')"><i class="bi bi-geo-alt"></i><span>${escapeHtml(city)}</span></div>`;
    });
    
    dropdownContent.innerHTML = html;
    selectedDisplay.textContent = filters.city || 'Все города';
}

window.selectCity = function(city) {
    filters.city = city;
    renderCityDropdown();
    renderFeed();
    const cityDropdown = document.getElementById('cityDropdown');
    if (cityDropdown) cityDropdown.classList.remove('show');
};

function renderFeed() {
    const feedGrid = document.getElementById('feedGrid');
    if (!feedGrid) return;
    
    feedGrid.className = `feed-grid ${viewMode}-view`;
    
    const filteredPosts = currentPosts.filter(post => {
        const matchesSearch = !filters.search || (post.name || '').toLowerCase().includes(filters.search.toLowerCase());
        const matchesCity = !filters.city || post.city === filters.city;
        const matchesTags = filters.tags.length === 0 || (post.tags && filters.tags.some(tag => post.tags.includes(tag)));
        return matchesSearch && matchesCity && matchesTags;
    });
    
    if (filteredPosts.length === 0) {
        feedGrid.innerHTML = `<div class="no-posts"><i class="bi bi-search"></i><h3>Ничего не найдено</h3><p>Попробуйте изменить параметры</p></div>`;
        return;
    }
    
    feedGrid.innerHTML = filteredPosts.map(post => `
        <div class="post-card" data-post-id="${post.id}">
            <img src="${post.cover_photo || ''}" alt="${escapeHtml(post.name)}" class="post-cover_photo" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'200\' viewBox=\'0 0 400 200\'%3E%3Crect width=\'400\' height=\'200\' fill=\'%23cccccc\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' fill=\'%23666666\' dy=\'.3em\'%3EНет фото%3C/text%3E%3C/svg%3E';">
            <div class="post-content">
                <div class="post-header">
                    <h3 class="post-name">${escapeHtml(post.name)}</h3>
                    ${isAdminUser ? `
                        <div class="post-actions-dropdown">
                            <button class="post-menu-btn" onclick="event.stopPropagation(); togglePostMenu('${post.id}')">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <div class="post-menu" id="post-menu-${post.id}">
                                <button onclick="event.stopPropagation(); editPost('${post.id}')"><i class="bi bi-pencil"></i> Редактировать</button>
                                <button onclick="event.stopPropagation(); deletePost('${post.id}')"><i class="bi bi-trash"></i> Удалить</button>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="post-city">${escapeHtml(post.city)}${post.address ? `, ${escapeHtml(post.address)}` : ''}</div>
                <p class="post-description">${escapeHtml(post.description || '')}</p>
                <div class="post-footer">
                    <div class="post-tags">
                        ${(post.tags || []).map(tag => `<span class="post-tag" style="background: var(--tag-${getTagColorIndex(tag)});">#${escapeHtml(tag)}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    initCardClicks();
}

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

window.editPost = function(postId) {
    alert('Функция редактирования в разработке');
};

window.deletePost = async function(postId) {
    if (!confirm('Вы уверены, что хотите удалить это место?')) return;
    
    const result = await apiService.removePlace(postId);
    
    if (result.success) {
        alert('Место удалено');
        await loadAndRenderFeed();
        closePostModal();
    } else {
        alert('Ошибка удаления: ' + result.error);
    }
};

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

window.openPostModal = function(postId) {
    const post = currentPosts.find(p => String(p.id) === String(postId));
    if (!post) {
        console.error('Post not found:', postId);
        return;
    }
    
    const modal = document.getElementById('postModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    if (!modal || !modalContent) return;
    
    currentPostId = postId;
    
    if (modalTitle) {
        modalTitle.textContent = post.name;
    }
    
    let overlay = document.querySelector('.modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
    }
    
    modalContent.innerHTML = `
        <img src="${post.cover_photo || ''}" alt="${escapeHtml(post.name)}" style="width:100%; max-height:300px; object-fit:cover; border-radius:16px; margin-bottom:16px;" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'200\' viewBox=\'0 0 400 200\'%3E%3Crect width=\'400\' height=\'200\' fill=\'%23cccccc\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' fill=\'%23666666\' dy=\'.3em\'%3EНет фото%3C/text%3E%3C/svg%3E';">
        <div class="post-city" style="color:var(--accent-color); margin-bottom:8px; font-weight:500;">${escapeHtml(post.city || '')}</div>
        <p class="post-description" style="margin-bottom:16px;">${escapeHtml(post.description || '')}</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
            ${(post.tags || []).map(tag => `<span class="post-tag" style="background: var(--tag-${getTagColorIndex(tag)});">#${escapeHtml(tag)}</span>`).join('')}
        </div>
        <h4 style="margin-bottom:12px;">Добавить в коллекцию:</h4>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px;" id="collectionButtons"></div>
    `;
    
    modal.style.display = 'block';
    overlay.style.display = 'block';
    renderCollectionButtons(postId);
};

window.closePostModal = function() {
    const modal = document.getElementById('postModal');
    if (modal) modal.style.display = 'none';
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.style.display = 'none';
    currentPostId = null;
};

async function renderCollectionButtons(postId) {
    const container = document.getElementById('collectionButtons');
    if (!container) return;
    
    const collections = await apiService.getCollections();
    
    let html = '';
    for (const collection of collections) {
        const collectionData = await apiService.getOneCollection(collection.id, {});
        const isInCollection = collectionData.places?.some(place => place.id == postId);
        
        html += `<button class="collection-btn ${isInCollection ? 'active' : ''}" onclick="togglePostInCollection('${postId}', '${collection.id}')">${escapeHtml(collection.name)}</button>`;
    }
    
    container.innerHTML = html;
}

window.togglePostInCollection = async function(postId, collectionId) {
    const collection = await apiService.getOneCollection(collectionId, {});
    const isInCollection = collection.places?.some(place => place.id == postId);
    
    if (!isInCollection) {
        await apiService.addToCollection(collectionId, postId);
    } else {
        await apiService.removeFromCollection(collectionId, postId);
    }
    
    if (currentPostId == postId) {
        await renderCollectionButtons(postId);
    }
};

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

function initThemeToggle() {
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

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        filters.search = e.target.value;
        renderFeed();
    });
}

document.addEventListener('click', function(event) {
    if (!event.target.closest('.post-actions-dropdown')) {
        document.querySelectorAll('.post-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    await loadCities();
    await loadTags();
    await updateAdminStatus();
    await loadAndRenderFeed();
    // initThemeToggle();
    // initProfileDropdown();
    initCityDropdown();
    initTagsDropdown();
    initSearch();
    initViewToggle();
    renderSelectedTags();
    
    if (window.updateUIForUser) {
        await window.updateUIForUser();
    }
});

window.renderCollectionButtons = renderCollectionButtons;
window.togglePostInCollection = togglePostInCollection;
window.openPostModal = openPostModal;
window.closePostModal = closePostModal;
window.loadAndRenderFeed = loadAndRenderFeed;
