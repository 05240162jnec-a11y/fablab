import axios from 'axios';

// ✅ Base configuration
axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// ✅ Setup interceptors to auto-add auth token
export const setupAxiosInterceptors = () => {
    // Request interceptor: add Authorization header
    axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor: handle 401 (token expired/invalid)
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Clear storage and redirect to login
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                localStorage.removeItem('admin');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
};

export default axios;