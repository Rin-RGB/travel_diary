import apiService from './apiService.js';
import api from './index.js';

async function checkAdminAccess() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        alert('Необходимо авторизоваться');
        window.location.href = 'index.html';
        return false;
    }
    
    const isAdminUser = await window.isAdmin();
    if (!isAdminUser) {
        alert('Только администраторы могут добавлять места');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

async function loadCities() {
    try {
        const cities = await api.getCities();
        const select = document.getElementById('placeCity');
        if (select) {
            select.innerHTML = '<option value="">Выберите город</option>';
            cities.forEach(city => {
                select.innerHTML += `<option value="${city.id}">${escapeHtml(city.city)}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading cities:', error);
        alert('Ошибка загрузки городов');
    }
}

async function loadTags() {
    try {
        const tags = await api.checkTags();
        const container = document.getElementById('tagsContainer');
        if (container && tags.length > 0) {
            container.innerHTML = tags.map(tag => `
                <label class="tag-checkbox-item">
                    <input type="checkbox" value="${tag.id}">
                    <span>#${escapeHtml(tag.name)}</span>
                </label>
            `).join('');
        } else {
            container.innerHTML = '<p class="no-tags">Нет доступных тегов</p>';
        }
    } catch (error) {
        console.error('Error loading tags:', error);
    }
}

function getSelectedTags() {
    const checkboxes = document.querySelectorAll('#tagsContainer input:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

async function createPlace(event) {
    event.preventDefault();
    
    const name = document.getElementById('placeTitle').value.trim();
    const cityId = document.getElementById('placeCity').value;
    const address = document.getElementById('placeAddress').value.trim();
    const description = document.getElementById('placeDescription').value.trim();
    const photoUrl = document.getElementById('placeImage').value.trim();
    const tags = getSelectedTags();
    if (!name) {
        alert('Введите название места');
        return;
    }
    
    if (!cityId) {
        alert('Выберите город');
        return;
    }
    const placeData = {
        name: name,
        city_id: cityId,
        address: address,
        description: description,
        photo_urls: photoUrl ? [photoUrl] : [],
        tags: tags
    };
    
    console.log('Sending place data:', placeData);
    
    try {
        const result = await apiService.createPlace(placeData);
        
        if (result.success) {
            alert('Место успешно создано!');
            document.getElementById('suggestForm').reset();
            document.querySelectorAll('#tagsContainer input').forEach(cb => cb.checked = false);
            window.location.href = 'index.html';
        } else {
            alert('Ошибка: ' + result.error);
        }
    } catch (error) {
        console.error('Error creating place:', error);
        alert('Ошибка при создании места: ' + (error.response?.data?.detail || 'Неизвестная ошибка'));
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function initTheme() {
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

function initDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const dropdown = document.getElementById('dropdownMenu');
    
    if (profileBtn && dropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
    }
}

function initLogout() {
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

function addSuggestStyles() {
    if (document.getElementById('suggest-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'suggest-styles';
    styles.textContent = `
        .suggest-form {
            max-width: 800px;
            margin: 0 auto;
        }
        .tags-checkboxes {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            padding: 12px 0;
        }
        .tag-checkbox-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            background: var(--tag-bg);
            border-radius: 20px;
            cursor: pointer;
        }
        .tag-checkbox-item input {
            cursor: pointer;
        }
        .required {
            color: #ff4444;
        }
        .no-tags {
            color: var(--tag-color);
            padding: 12px 0;
        }
    `;
    document.head.appendChild(styles);
}

document.addEventListener('DOMContentLoaded', async () => {
    addSuggestStyles();
    
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) return;
    
    await loadCities();
    await loadTags();
    
    initTheme();
    initDropdown();
    initLogout();
    
    const form = document.getElementById('suggestForm');
    if (form) {
        form.addEventListener('submit', createPlace);
    }
});