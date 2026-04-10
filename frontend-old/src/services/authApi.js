import axios from 'axios';

// استفاده از پراکسی که در vite.config تنظیم کردیم
const api = axios.create({
  baseURL: '/api/auth',
});

// ارسال کوکی‌ها به صورت خودکار با هر درخواست
api.defaults.withCredentials = true;

export const loginUser = async (phone, password) => {
  try {
    const response = await api.post('/login', { phone, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, errorMessage: 'خطا در برقراری ارتباط با سرور' };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', {
      name: userData.name,
      phone: userData.phone,
      password: userData.password,
      accountType: userData.accountType // 'User' یا 'Agency'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, errorMessage: 'خطا در برقراری ارتباط با سرور' };
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/logout');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false };
  }
};

export const validateToken = async () => {
  try {
    const response = await api.get('/validate');
    return response.data;
  } catch (error) {
    return { success: false };
  }
};