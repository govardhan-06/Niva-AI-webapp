import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { tokenManager } from './services/auth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Course from './pages/Course';
import InterviewPage from './pages/InterviewPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  // Check if user is already authenticated
  const isAuthenticated = tokenManager.isAuthenticated();

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <Login />
            } 
          />
          <Route 
            path="/signup" 
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <Signup />
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/course" 
            element={
              <ProtectedRoute>
                <Course />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/interview" 
            element={
              <ProtectedRoute>
                <InterviewPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/course" : "/login"} replace />
            } 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              <Navigate to={isAuthenticated ? "/course" : "/login"} replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
