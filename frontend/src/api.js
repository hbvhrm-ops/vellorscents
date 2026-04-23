import axios from 'axios';

// In production (Render), VITE_API_URL is set as an env var in the Render dashboard.
// In local dev, fall back to localhost:8000.
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');

const api = axios.create({
  baseURL: API_URL,
});

export const apiService = {
  // Sales
  getSales: () => api.get('/sales/'),
  createSale: (data) => api.post('/sales/', data),
  updateSale: (id, data) => api.put(`/sales/${id}`, data),
  deleteSale: (id) => api.delete(`/sales/${id}`),
  
  // Debts (Unpaid Sales)
  getDebts: () => api.get('/debts/'),
  payDebt: (id, amount) => api.post(`/sales/${id}/pay/`, null, { params: { amount } }),

  // Resellers
  getResellers: () => api.get('/resellers/'),
  createReseller: (data) => api.post('/resellers/', data),

  // Products
  getProducts: () => api.get('/products/'),
  createProduct: (data) => api.post('/products/', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};
