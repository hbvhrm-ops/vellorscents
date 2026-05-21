import axios from 'axios';

// In production (Render/Vercel), VITE_API_URL is set as an env var.
// In local dev, fall back to localhost:8000.
const rawApiUrl = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:8000' : '');
const API_URL = rawApiUrl.replace(/\/+$/, ''); // Prevent duplicate slashes

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds to accommodate cold starts
});

// Interceptor to print out exact error payload to console
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error Payload:", error.response || error.message || error);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth
  authLogin: (data) => api.post('/api/auth/login', data),

  // Sales
  getSales: (resellerId) => api.get('/api/sales', { params: { reseller_id: resellerId } }),
  createSale: (data) => api.post('/api/sales', data),
  updateSale: (id, data) => api.put(`/api/sales/${id}`, data),
  deleteSale: (id) => api.delete(`/api/sales/${id}`),
  
  // Debts (Unpaid Sales)
  getDebts: (resellerId) => api.get('/api/debts', { params: { reseller_id: resellerId } }),
  payDebt: (id, amount) => api.post(`/api/sales/${id}/pay`, null, { params: { amount } }),

  // Resellers
  getResellers: () => api.get('/api/resellers'),
  createReseller: (data) => api.post('/api/resellers', data),
  updateReseller: (id, data) => api.put(`/api/resellers/${id}`, data),
  deleteReseller: (id) => api.delete(`/api/resellers/${id}`),

  // Products
  getProducts: () => api.get('/api/products'),
  createProduct: (data) => api.post('/api/products', data),
  updateProduct: (id, data) => api.put(`/api/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),
};
