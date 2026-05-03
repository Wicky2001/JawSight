import axios from 'axios';

// --- API Client Setup ---
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/'; 

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

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
