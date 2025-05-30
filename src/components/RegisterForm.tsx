import { useState } from 'react';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { isApiError } from '../types/api';
import type { AuthResponse } from '../types/auth';

export const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await authApi.register({ username, password, passwordConfirmation });
      if (isApiError(response.data)) {
        setError(response.data.message);
        return;
      }
      const authResponse = response.data as AuthResponse;
      localStorage.setItem('username', username);
      login(authResponse.tokens);
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 409 && err.response?.data?.code === 1) {
        setError(err.response.data.message);
      } else if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-center">
        <Card className="shadow-sm border-0" style={{ width: '480px', borderRadius: '16px' }}>
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#3498db" viewBox="0 0 16 16" className="mb-3">
                <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
              </svg>
              <h2 className="fw-bold" style={{ color: '#2c3e50' }}>Create Account</h2>
              <p style={{ color: '#64748b' }}>Join Fridge Tracker today</p>
            </div>
            
            {error && <Alert variant="danger" className="rounded-3 mb-4">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label style={{ color: '#64748b', fontWeight: '500' }}>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  placeholder="Choose a username (min. 3 characters)"
                  style={{ 
                    height: '45px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.95rem'
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={{ color: '#64748b', fontWeight: '500' }}>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Choose a password (min. 8 characters)"
                  style={{ 
                    height: '45px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.95rem'
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={{ color: '#64748b', fontWeight: '500' }}>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Confirm your password"
                  style={{ 
                    height: '45px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.95rem'
                  }}
                />
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit"
                className="w-100"
                style={{ 
                  height: '45px',
                  borderRadius: '12px',
                  backgroundColor: '#3498db',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  marginTop: '8px'
                }}
              >
                Create Account
              </Button>

              <div className="text-center mt-4">
                <p className="mb-0" style={{ color: '#64748b' }}>
                  Already have an account? <Link to="/login" style={{ color: '#3498db', textDecoration: 'none', fontWeight: '500' }}>Sign In</Link>
                </p>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}; 