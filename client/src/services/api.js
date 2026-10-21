import axios from 'axios';

// In development this is http://localhost:5000/api.
// In production it comes from the VITE_API_URL environment variable (set on Vercel).
// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
// });
// Remove any trailing slash, and add /api if it is missing, so a small mistake in the
// environment variable cannot break the app.
const rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
const api = axios.create({
  baseURL: rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`,
});
// Before every request, attach the saved JWT token (if there is one)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// After every response: if the server says our token is invalid/expired (401),
// remove it and tell the app, so the user is sent back to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthForm = error.config && /\/auth\/(login|register)$/.test(error.config.url || '');
    if (error.response && error.response.status === 401 && !isAuthForm && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  }
);

// Turns an axios error into a message we can show to the user
export function getErrorMessage(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return 'Cannot reach the server. Please check your internet connection and try again.';
}

export default api;
