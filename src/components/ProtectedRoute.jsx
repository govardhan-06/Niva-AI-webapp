import { Navigate } from 'react-router-dom';
import { tokenManager } from '../services/auth';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = tokenManager.isAuthenticated();
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
