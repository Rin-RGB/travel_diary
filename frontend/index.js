import axios from "axios";
const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
    }
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(
                        "http://localhost:3000/api/v1/auth/refresh",
                        { refresh_token: refreshToken }
                    );
                    
                    if (response.data.access_token) {
                        localStorage.setItem('access_token', response.data.access_token);
                        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
                        return apiClient(originalRequest);
                    }
                } catch (refreshError) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('currentUser');
                    window.location.href = '/index.html';
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);


export const api = {
    //1.1
    sendCode: async (email) => {
        let response = await apiClient.post("/v1/auth/code", { email });
        return response.data;
    },
    
    //1.2
    verifyCode: async (email, code) => {
        let response = await apiClient.post("/v1/auth/verify", { email, code });
        if (response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
        }
        return response.data;
    },
    
    //1.3
    refreshToken: async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        
        let response = await apiClient.post("/v1/auth/refresh", { refresh_token: refreshToken });
        if (response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
        }

        return response.data;
    },

    //2.1
    getPlaces: async (params = {}) => {
        let response = await apiClient.get("/v1/places", { params });
        return response.data;
    },

    //2.2
    getFeed: async (params = {}) => {
        let response = await apiClient.get("/v1/places/feed", { params });
        return response.data;
    },
    
    //2.3
    getCard: async (id) => {
        let response = await apiClient.get(`/v1/places/${id}`);
        return response.data;
    },
    
    //2.4
    createPlaceAdmin: async (placeData) => {
        let response = await apiClient.post("/api/v1/places", placeData);
        return response.data;
    },
    
    //2.5
    editPlace: async (id, updateData) => {
        let response = await apiClient.patch(`/v1/places/${id}`, updateData);
        return response.data;
    },
    
    //2.6
    deletePlace: async (id) => {
        let response = await apiClient.delete(`/v1/places/${id}`);
        return response.data;
    },
    
    //2.2.1
    /*
    getPlacesStatus: async () => {
        let response = await apiClient.get("/v1/place_statuses");
        return response.data;
    },*/
    
    //2.2.2
    /*
    getPlaceStatus: async(id) => {
        let response = await apiClient.get(`/v1/place_statuses/${id}`);
        return response.data;
    },*/

    //3.1
    getCities: async() => {
        let response = await apiClient.get("/v1/cities");
        return response.data;
    },

    //3.2
    getCity: async(id) => {
        let response = await apiClient.get(`/v1/cities/${id}`);
        return response.data;
    },

    //3.3
    /*
    postCity: async() => {
        let response = await apiClient.post("/api/v1/cities");
        return response.data;
    },*/

    //4.1
    allUserFolders: async(params = {}) => {
        let response = await apiClient.get("/v1/folders", { params });
        return response.data;
    },

    //4.2
    getOneCollection: async(id, params = {}) => {
        let response = await apiClient.get(`/v1/folders/${id}`, params = {});
        return response.data;
    },

    //4.3
    addCollection: async(name) => {
        let response = await apiClient.post("/v1/folders", { name });
        return response.data;
    },

    //4.4
    editCollection: async(id, name) => {
        let response = await apiClient.patch(`/v1/folders/${id}`, { name });
        return response.data;
    },

    //4.5
    addPlaceInCollection: async(folderId, placeId) => {
        let response = await apiClient.post(`/v1/folders/${folderId}/places/${placeId}`);
        return response.data;
    },

    //4.6
    deletePlaceFromCollection: async(folderId, placeId) => {
        let response = await apiClient.delete(`/v1/folders/${folderId}/places/${placeId}`);
        return response.data;
    },

    //5.1
    currentUserData: async() => {
        let response = await apiClient.get("/v1/users/me");
        return response.data;
    },

    //5.2
    /*
    updateUserData: async() => {
        let response = await apiClient.patch("/v1/users/me");
        return response.data;
    },*/

    //5.3
    /*
    deleteAccount: async() => {
        let response = await apiClient.delete("/v1/users/me");
        return response.data;
    },*/

    //5.4
    changeRole: async(userId, role) => {
        let response = await apiClient.patch(`/v1/users/${userId}/role`,  { role });
        return response.data;
    },

    //5.5
    checkRole: async() => {
        let response = await apiClient.get("/v1/users/roles");
        return response.data;
    },

    //6.1
    checkTags: async() => {
        let response = await apiClient.get("/v1/tags");
        return response.data;
    },

    //6.2
    addTag: async(name) => {
        let response = await apiClient.post("/v1/tags", { name });
        return response.data;
    },

    //6.3
    editTag: async(id, name) => {
        let response = await apiClient.patch(`/v1/tags/${id}`, { name });
        return response.data;
    },

    //6.4
    deleteTag: async(id) => {
        let response = await apiClient.delete(`/v1/tags/${id}`);
        return response.data;
    }
};

export default api;