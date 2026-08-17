import axios from 'axios';

const api = axios.create({
    baseURL: 'https://tmbisacademyback-production.up.railway.app/api/',
    withCredentials: true,
    headers: {
    'Content-Type': 'application/json',
    },
    });

    // Automatically attach the access token to every request
    api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token && token !== 'null' && token !== 'undefined') {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;