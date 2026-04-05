import { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Decode token to get user info
    const initializeAuth = () => {
      if (token) {
        try {
          // Decode JWT token to get user info
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const payload = JSON.parse(jsonPayload);
          const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
          const username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
          const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
          const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          
          setUser({
            id: userId,
            username: username,
            email: email,
            roles: Array.isArray(roles) ? roles : [roles].filter(Boolean)
          });
        } catch (error) {
          // Token is invalid, logout
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await adminApi.login(username, password);
      
      if (response.success) {
        const { token: newToken, user: userData } = response;
        
        // Token is now stored in httpOnly cookie by backend
        // Keep localStorage as fallback for backward compatibility
        if (newToken) {
          localStorage.setItem('adminToken', newToken);
          setToken(newToken);
        }
        
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: response.errorMessage || 'Login failed' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 
                          error.response?.data?.message || 
                          'Login error';
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear httpOnly cookie
      await adminApi.logout();
    } catch (error) {
      // Silent fail on logout error
    } finally {
      // Clear localStorage and state
      localStorage.removeItem('adminToken');
      setToken(null);
      setUser(null);
    }
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const isAdmin = () => {
    return user?.roles?.includes('Admin') || false;
  };

  const getToken = () => {
    return token;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

