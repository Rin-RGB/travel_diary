import { api } from './index.js';

class ApiService {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.posts = [];
    }

    async login(email, code) {
        try {
            const response = await api.verifyCode(email, code);
            this.isAuthenticated = true;
            
            const userData = await api.currentUserData();
            this.currentUser = userData;
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            return { success: true, user: userData };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.response?.data?.detail || 'Ошибка входа' };
        }
    }

    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('currentUser');
    }

    async getCurrentUser() {
        try {
            if (this.currentUser) return this.currentUser;
            const userData = await api.currentUserData();
            this.currentUser = userData;
            return userData;
        } catch (error) {
            return null;
        }
    }

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

    async getCities() {
        try {
            const response = await api.getCities();
            return response;
        } catch (error) {
            console.error('Get cities error:', error);
            return [];
        }
    }

    async getTags() {
        try {
            const response = await api.checkTags();
            return response;
        } catch (error) {
            console.error('Get tags error:', error);
            return [];
        }
    }

    async createPlace(placeData) {
        try {
            const response = await api.createPlaceAdmin(placeData);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || 'Ошибка создания' };
        }
    }

    async updatePlace(id, updateData) {
        try {
            const response = await api.editPlace(id, updateData);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || 'Ошибка обновления' };
        }
    }

    async removePlace(id) {
        try {
            await api.deletePlace(id);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || 'Ошибка удаления' };
        }
    }

    async getCollections() {
        try {
            const response = await api.allUserFolders();
            return response.items || [];
        } catch (error) {
            console.error('Get collections error:', error);
            return [];
        }
    }

    async createCollection(name) {
        try {
            const response = await api.addCollection(name);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || 'Ошибка создания' };
        }
    }

    async editCollection(id, name) {
        try {
            const response = await api.editCollection(id, name);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || 'Ошибка редактирования' };
        }
    }

    async deleteCollection(id) {
        try {
            await api.deleteFolder(id);
            return { success: true };
        } catch (error) {
            console.error('Delete collection error:', error);
            return { success: false, error: error.response?.data?.detail || 'Ошибка удаления' };
        }
    }

    async addToCollection(folderId, placeId) {
        try {
            await api.addPlaceInCollection(folderId, placeId);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || 'Ошибка добавления' };
        }
    }

    async removeFromCollection(folderId, placeId) {
        try {
            await api.deletePlaceFromCollection(folderId, placeId);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || 'Ошибка удаления' };
        }
    }

    async changeUserRole(userId, role) {
        try {
            const response = await api.changeRole(userId, role);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || 'Ошибка изменения роли' };
        }
    }

    async getOneCollection(id, params = {}) {
        try {
            const response = await api.getOneCollection(id, params);
            return response;
        } catch (error) {
            console.error('Get one collection error:', error);
            return { places: [] };
        }
    }
}

export default new ApiService();