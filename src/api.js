import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, 
});

// --- 1. REQUEST INTERCEPTOR (Attaches the token to requests) ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 2. RESPONSE INTERCEPTOR (Catches expired tokens) ---
api.interceptors.response.use(
  (response) => {
    // If the request is successful, just return the data normally
    return response;
  },
  (error) => {
    // If the backend says "401 Unauthorized" (Token Expired / Invalid)
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Logging out...");
      
      // 1. Wipe the invalid token and user data
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      
      // 2. Force the browser back to the login/home page
      window.location.href = '/'; 
    }
    
    // For all other errors (like 404 or 500), pass them down to the component
    return Promise.reject(error);
  }
);

export default api;