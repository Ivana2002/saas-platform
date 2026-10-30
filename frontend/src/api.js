import axios from 'axios';

// Bazne adrese tvojih Spring Boot servisa
export const ONBOARDING_URL = 'http://localhost:8081/api/onboarding';
export const TENANT_URL = 'http://localhost:8082/api/tenants';
export const USER_URL = 'http://localhost:8083/api/users';

// Axios instanca sa automatskim slanjem JWT tokena
const api = axios.create();

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;