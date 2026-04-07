import { api } from './index.js';

class ApiService {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.posts = [];
    }

    // Вход
    async login(email, code) {
        try {
            const response = await api.verifyCode(email, code);
            this.isAuthenticated = true;
            
            // Данные пользователя
            const userData = await api.currentUserData();
            this.currentUser = userData;
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            return { success: true, user: userData };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.response?.data?.message || 'Ошибка входа' };
        }
    }

    // Выход
    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('currentUser');
    }

    // Загрузка ленты
    async loadPlaces(params = {}) {
        try {
            const response = await api.getPlaces(params);
            this.posts = response.items || [];
            return this.posts;
        } catch (error) {
            console.error('Load feed error:', error);
            return [];
        }
    }

    // Получение городов
    async getCities() {
        try {
            const response = await api.getCities();
            return response;
        } catch (error) {
            console.error('Get cities error:', error);
            return [];
        }
    }

    // Получение тегов
    async getTags() {
        try {
            const response = await api.checkTags();
            return response;
        } catch (error) {
            console.error('Get tags error:', error);
            return [];
        }
    }

    // Создание места (админ)
    async createPlace(placeData) {
        try {
            const response = await api.createPlaceAdmin(placeData);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.response?.data?.message };
        }
    }

    // Редактирование места (админ)
    async updatePlace(id, updateData) {
        try {
            const response = await api.editPlace(id, updateData);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.response?.data?.message };
        }
    }

    // Удаление места (админ)
    async removePlace(id) {
        try {
            await api.deletePlace(id);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message };
        }
    }

    // Получение коллекций
    async getCollections() {
        try {
            const response = await api.allUserFolders();
            return response.items || [];
        } catch (error) {
            console.error('Get collections error:', error);
            return [];
        }
    }

    // Создание коллекции
    async createCollection(name) {
        try {
            const response = await api.addCollection(name);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.response?.data?.message };
        }
    }

    // Добавление места в коллекцию
    async addToCollection(folderId, placeId) {
        try {
            await api.addPlaceInCollection(folderId, placeId);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message };
        }
    }

    // Удаление места из коллекции
    async removeFromCollection(folderId, placeId) {
        try {
            await api.deletePlaceFromCollection(folderId, placeId);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message };
        }
    }

    // Изменение роли (админ)
    async changeUserRole(userId, role) {
        try {
            const response = await api.changeRole(userId, role);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.response?.data?.message };
        }
    }
}

export default new ApiService();