// import axios from 'axios';
// import { useAuth } from '../contexts/AuthContext'; // مسیر AuthContext خود را چک کنید

// // یک instance از axios می‌سازیم
// const api = axios.create({
//   baseURL: '/api/agency',
// });

// // این تابع یک هوک (Hook) است که توکن را برمیگرداند
// const useApi = () => {
//   const { getToken } = useAuth();

//   // اضافه کردن رهگیر (Interceptor)
//   api.interceptors.request.use(
//     (config) => {
//       const token = getToken(); // توکن را از AuthContext میخوانیم
//       if (token) {
//         // توکن را به هدر Authorization اضافه میکنیم
//         config.headers['Authorization'] = `Bearer ${token}`;
//       }
//       return config;
//     },
//     (error) => {
//       return Promise.reject(error);
//     }
//   );

//   return api;
// };


// // توابع API را به این شکل تغییر میدهیم
// export const useAgencyApi = () => {
//   const apiInstance = useApi();

//   const saveAgencyFlight = async (flightData) => {
//     try {
//       const response = await apiInstance.post('/save-flight', flightData);
//       return response.data;
//     } catch (error) {
//       console.error('Error saving agency flight:', error.response);
//       throw error.response?.data || { message: 'Failed to save flight' };
//     }
//   };

//   const getMyAgencyFlights = async () => {
//     try {
//       const response = await apiInstance.get('/my-flights');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching agency flights:', error.response);
//       throw error.response?.data || { message: 'Failed to fetch flights' };
//     }
//   };
  
//   return { saveAgencyFlight, getMyAgencyFlights };
// };



//agencyApi.js : 
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/agency',
});

// اضافه کردن خودکار توکن به تمام درخواست‌های این فایل
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const saveAgencyFlight = async (flightData) => {
  try {
    const response = await api.post('/save-flight', flightData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error saving flight' };
  }
};

export const getMyAgencyFlights = async () => {
  try {
    const response = await api.get('/my-flights');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching flights' };
  }
};


export const getAgencyProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching profile' };
  }
};

export const updateAgencyProfile = async (profileData) => {
  try {
    const response = await api.put('/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating profile' };
  }
};