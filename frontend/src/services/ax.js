import conf from './conf';
import axios from 'axios';

const ax = axios.create();

// Request interceptor to add JWT token
ax.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle token expiration
ax.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const token = localStorage.getItem('token');
            const guestId = localStorage.getItem('guestId');
            // Only redirect to login if user has a token (not guest mode)
            if (token && !guestId) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default ax;