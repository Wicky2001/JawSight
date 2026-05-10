import axios from 'axios';
import { de } from 'zod/locales';


// --- API Client Setup ---
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'; 
const currentPath = window.location.pathname;



const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});




client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    debugger;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {

        
        // call refresh endpoint
        const response = await refreshClient.post("/auth/refresh");
        console.log(response.status);
  
        
        return client(originalRequest);

      } catch (err) {
        debugger;
        // logout if refresh fails
        window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);



export const api = {
  get: (endpoint: string, queryParams?: any, config?: any) =>
    client.get(endpoint, { params: queryParams, ...config }),

  post: (endpoint: string, body?: any, config?: any) =>
    client.post(endpoint, body, config),

  patch: (endpoint: string, body?: any, config?: any) =>
    client.patch(endpoint, body, config),

  delete: (endpoint: string, body?: any, config?: any) =>
    client.delete(endpoint, { data: body, ...config }),
};
