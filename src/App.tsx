import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Items } from './pages/Items';
import { Fridges } from './pages/Fridges';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterForm />
          </PublicRoute>
        }
      />
      <Route
        path="/items"
        element={
          <PrivateRoute>
            <Items />
          </PrivateRoute>
        }
      />
      <Route
        path="/fridges"
        element={
          <PrivateRoute>
            <Fridges />
          </PrivateRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Fridges />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

const AuthContextInjector = () => {
  const auth = useAuth();
  
  useEffect(() => {
    (window as any).__authContext = auth;
    return () => {
      delete (window as any).__authContext;
    };
  }, [auth]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthContextInjector />
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Navbar />
          <div style={{ flex: 1, backgroundColor: '#f8f9fa', width: '100%' }}>
            <Container>
              <AppRoutes />
            </Container>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
