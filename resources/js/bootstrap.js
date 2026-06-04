import axios from 'axios';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// ✅ Enable credentials for CSRF cookies
window.axios.defaults.withCredentials = true;
window.axios.defaults.withXSRFToken = true;

// ✅ Get CSRF token from meta tag if it exists
const token = document.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.getAttribute('content');
} else {
    // Try to get from cookie
    const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
    if (csrfCookie) {
        window.axios.defaults.headers.common['X-XSRF-TOKEN'] = decodeURIComponent(csrfCookie.split('=')[1]);
    }
}