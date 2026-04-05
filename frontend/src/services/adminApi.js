import axios from 'axios';

// Create axios instance for admin API
// Use relative path when served from backend
const API_BASE_URL = '/api';

const adminAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies with requests
});

// Add token to requests
adminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses
adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Auth
  login: async (username, password) => {
    const response = await adminAxios.post('/auth/login', { username, password });
    return response.data;
  },

  logout: async () => {
    const response = await adminAxios.post('/auth/logout');
    return response.data;
  },

  // Dashboard
  getDashboardStats: async () => {
    const response = await adminAxios.get('/admin/dashboard/stats');
    return { success: true, data: response.data };
  },

  // Users
  getUsers: async (page = 1, pageSize = 10) => {
    const response = await adminAxios.get('/admin/users', { params: { page, pageSize } });
    return { success: true, data: response.data };
  },

  createUser: async (userData) => {
    const response = await adminAxios.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await adminAxios.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await adminAxios.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Bookings
  getBookings: async (page = 1, pageSize = 10, status = null) => {
    const params = { page, pageSize };
    if (status !== null) {
      params.status = status;
    }
    const response = await adminAxios.get('/admin/bookings', { params });
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await adminAxios.post('/admin/bookings', bookingData);
    return response.data;
  },

  updateBookingStatus: async (bookingId, statusData) => {
    const response = await adminAxios.put(`/admin/bookings/${bookingId}/status`, statusData);
    return response.data;
  },

  // Search Logs
  getSearchLogs: async (page = 1, pageSize = 10) => {
    const response = await adminAxios.get('/admin/logs', { params: { page, pageSize } });
    return { success: true, data: response.data };
  },

  // Settings
  getSettings: async () => {
    const response = await adminAxios.get('/admin/settings');
    return { success: true, data: response.data };
  },

  getSetting: async (key) => {
    const response = await adminAxios.get(`/admin/settings/${key}`);
    return response.data;
  },

  updateSetting: async (key, data) => {
    const response = await adminAxios.put(`/admin/settings/${key}`, data);
    return response.data;
  },

  // Airlines
  getAirlines: async (page = 1, pageSize = 10) => {
    const response = await adminAxios.get('/admin/airlines', { params: { page, pageSize } });
    return { success: true, data: response.data };
  },

  createAirline: async (airlineData) => {
    const response = await adminAxios.post('/admin/airlines', airlineData);
    return response.data;
  },

  updateAirline: async (airlineId, airlineData) => {
    const response = await adminAxios.put(`/admin/airlines/${airlineId}`, airlineData);
    return response.data;
  },

  deleteAirline: async (airlineId) => {
    const response = await adminAxios.delete(`/admin/airlines/${airlineId}`);
    return response.data;
  }
};

export default adminApi;

