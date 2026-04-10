// //frontend/src/contexts/AuthContext.jsx : 
// import { createContext, useContext, useState, useEffect } from 'react';
// import { adminApi } from '../services/adminApi';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem('adminToken'));
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Decode token to get user info
//     const initializeAuth = () => {
//       if (token) {
//         try {
//           // Decode JWT token to get user info
//           const base64Url = token.split('.')[1];
//           const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//           const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
//             return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//           }).join(''));
          
//           const payload = JSON.parse(jsonPayload);
//           const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
//           const username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
//           const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
//           const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          
//           setUser({
//             id: userId,
//             username: username,
//             email: email,
//             roles: Array.isArray(roles) ? roles : [roles].filter(Boolean)
//           });
//         } catch (error) {
//           // Token is invalid, logout
//           logout();
//         }
//       }
//       setLoading(false);
//     };

//     initializeAuth();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   const login = async (username, password) => {
//     try {
//       const response = await adminApi.login(username, password);
      
//       if (response.success) {
//         const { token: newToken, user: userData } = response;
        
//         // Token is now stored in httpOnly cookie by backend
//         // Keep localStorage as fallback for backward compatibility
//         if (newToken) {
//           localStorage.setItem('adminToken', newToken);
//           setToken(newToken);
//         }
        
//         setUser(userData);
//         return { success: true };
//       } else {
//         return { success: false, error: response.errorMessage || 'Login failed' };
//       }
//     } catch (error) {
//       const errorMessage = error.response?.data?.errorMessage || 
//                           error.response?.data?.message || 
//                           'Login error';
//       return { 
//         success: false, 
//         error: errorMessage
//       };
//     }
//   };

//   const logout = async () => {
//     try {
//       // Call logout endpoint to clear httpOnly cookie
//       await adminApi.logout();
//     } catch (error) {
//       // Silent fail on logout error
//     } finally {
//       // Clear localStorage and state
//       localStorage.removeItem('adminToken');
//       setToken(null);
//       setUser(null);
//     }
//   };

//   const isAuthenticated = () => {
//     return !!token && !!user;
//   };

//   const isAdmin = () => {
//     return user?.roles?.includes('Admin') || false;
//   };

//   const getToken = () => {
//     return token;
//   };

//   const value = {
//     user,
//     token,
//     loading,
//     login,
//     logout,
//     isAuthenticated,
//     isAdmin,
//     getToken
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export default AuthContext;




// import { createContext, useContext, useState, useEffect } from 'react';
// import { loginUser, logoutUser as apiLogout } from '../services/authApi'; 

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem('adminToken'));
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const initializeAuth = () => {
//       const storedToken = localStorage.getItem('adminToken');
//       if (storedToken) {
//         setToken(storedToken); // اطمینان از اینکه state با localStorage هماهنگ است
//         try {
//           const base64Url = storedToken.split('.')[1];
//           const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//           const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
//             return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//           }).join(''));
          
//           const payload = JSON.parse(jsonPayload);
//           // خواندن کلیم‌های استاندارد JWT
//           const userId = payload.nameid || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
//           const username = payload.unique_name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
//           const email = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
//           const roles = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
//           const name = payload.given_name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || username;           
//           setUser({
//             id: userId,
//             username: username,
//             name: name, // اضافه شد
//             email: email,
//             roles: Array.isArray(roles) ? roles : [roles].filter(Boolean)
//           });
//         } catch (error) {
//           logout();
//         }
//       }
//       setLoading(false);
//     };

//     initializeAuth();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // token را از dependency حذف میکنیم تا حلقه بی‌نهایت ایجاد نشود

//   // تابع لاگین ادمین (دست نخورده)
// // ...
//   const login = async (phone, password) => { // ورودی را به phone و password تغییر دادیم
//     try {
//       // حالا تابع صحیح loginUser از authApi صدا زده می‌شود
//       const response = await loginUser(phone, password);
      
//       if (response.success) {
//         const { token: newToken, user: userData } = response;
//         localStorage.setItem('adminToken', newToken); // برای سازگاری با سیستم قدیمی
//         setToken(newToken);
//         setUser(userData);
//         return { success: true };
//       } else {
//         return { success: false, error: response.errorMessage || 'Login failed' };
//       }
//     } catch (error) {
//       return { success: false, error: error.message || 'Login error' };
//     }
//   };
// // ...

//   // --- تابع جدید برای آپدیت state بعد از ثبت‌نام ---
//   const handleSuccessfulAuth = (userData, userToken) => {
//     localStorage.setItem('adminToken', userToken); // توکن را در localStorage هم ذخیره می‌کنیم
//     setToken(userToken);
//     setUser(userData);
//   };
//   // ----------------------------------------------------

//   const logout = async () => {
//     try {
//       await adminApi.logout();
//     } catch (error) {
//       // ignore
//     } finally {
//       localStorage.removeItem('adminToken');
//       setToken(null);
//       setUser(null);
//     }
//   };


//    const isAuthenticated = () => {
//     return !!token && !!user;
//   };

//   const isAdmin = () => {
//     return user?.roles?.includes('Admin') || false;
//   };

//   const getToken = () => {
//     return token;
//   };




//   const value = {
//     user,
//     token,
//     loading,
//     login,
//     handleSuccessfulAuth, // تابع جدید را export می‌کنیم
//     logout,
//     isAuthenticated, // اضافه شد
//     isAdmin,         // اضافه شد
//     getToken         // اضافه شد
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   return useContext(AuthContext);
// };



import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/adminApi';
import { loginUser, logoutUser as apiLogout } from '../services/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- تغییر کلیدی: اضافه کردن useCallback برای جلوگیری از لوپ بی‌نهایت ---
  const processToken = useCallback((token) => {
    if (!token) {
      setUser(null);
      localStorage.removeItem('adminToken');
      return;
    }
    try {
      localStorage.setItem('adminToken', token);
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const payload = JSON.parse(jsonPayload);
      
      const roles = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      setUser({
        id: payload.nameid || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        username: payload.unique_name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        name: payload.given_name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
        email: payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        roles: Array.isArray(roles) ? roles : [roles].filter(Boolean)
      });
    } catch (error) {
      setUser(null);
      localStorage.removeItem('adminToken');
    }
  }, []); // [] به این معنی است که این تابع هرگز نباید دوباره ساخته شود

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      processToken(token);
    }
    setLoading(false);
  }, [processToken]); // به React می‌گوییم به processToken وابسته است

  // --- توابع مخصوص لاگین ---

  const adminLogin = async (username, password) => {
    const response = await adminApi.login(username, password);
    if (response.success) {
      processToken(response.token);
    }
    return response;
  };
  
  const userLogin = async (phone, password) => {
    const response = await loginUser(phone, password);
    if (response.success) {
      processToken(response.token);
    }
    return response;
  };
  
  const handleSuccessfulAuth = (userData, userToken) => {
    processToken(userToken);
  };

  const logout = async () => {
    await apiLogout();
    processToken(null);
  };

  // --- توابع بررسی دسترسی ---

  const isAuthenticated = () => {
    const token = localStorage.getItem('adminToken');
    return !!token && !!user;
  };

  const isAdmin = () => {
    return user?.roles?.includes('Admin') || false;
  };

  const getToken = () => {
    return localStorage.getItem('adminToken');
  };

  // ----------------------------------------------------------------

  const value = {
    user,
    loading,
    getToken,
    isAuthenticated, 
    isAdmin,        
    isAgency: user?.roles?.includes('Agency') || false, 
    login: userLogin, 
    adminLogin,
    handleSuccessfulAuth,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* تا زمانی که پروسه بررسی توکن تمام نشده، کل سایت را منتظر نگه میداریم */}
      {!loading && children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);