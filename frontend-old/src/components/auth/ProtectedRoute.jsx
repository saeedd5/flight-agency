//ProtectedRoute.jsx : 
import { Navigate, useLocation } from 'react-router-dom';
import Spin from 'antd/es/spin';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f0f2f5'
      }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated()) {
    // Redirect to login page with return URL
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin()) {
    // User is authenticated but not an admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

