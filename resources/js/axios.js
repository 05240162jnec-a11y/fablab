import axios from 'axios';

// ✅ Base configuration
axios.defaults.baseURL = `${import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'}`;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// ✅ Setup interceptors to auto-add auth token
export const setupAxiosInterceptors = () => {
    // Request interceptor: add Authorization header
    axios.interceptors.request.use(
        (config) => {
            // Use per-tab storage so multiple logins in different tabs don't overwrite each other
            const token = sessionStorage.getItem('auth_token');
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
                sessionStorage.removeItem('auth_token');
                sessionStorage.removeItem('user');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
};

export default axios;