import { Container, Nav, Navbar as BsNavbar, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <BsNavbar 
      expand="lg" 
      style={{ 
        backgroundColor: '#2c3e50',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)'
      }}
    >
      <Container>
        <BsNavbar.Brand 
          as={Link} 
          to="/" 
          className="d-flex align-items-center"
          style={{ color: '#ffffff', fontWeight: '600', fontSize: '1.25rem' }}
        >
          Fridge Tracker
        </BsNavbar.Brand>
        <BsNavbar.Toggle 
          aria-controls="basic-navbar-nav" 
          style={{
            border: 'none',
            padding: '0.25rem 0.75rem'
          }}
        >
          <span className="navbar-toggler-icon" style={{ filter: 'brightness(0) invert(1)' }}></span>
        </BsNavbar.Toggle>
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated ? (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/fridges"
                  style={{ 
                    color: '#ffffff',
                    fontWeight: '500',
                    padding: '8px 16px',
                    transition: 'opacity 0.2s ease',
                    opacity: 0.9
                  }}
                  className="mx-lg-1 my-2 my-lg-0 ps-0 ps-lg-3"
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                >
                  Fridges
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/items"
                  style={{ 
                    color: '#ffffff',
                    fontWeight: '500',
                    padding: '8px 16px',
                    transition: 'opacity 0.2s ease',
                    opacity: 0.9
                  }}
                  className="mx-lg-1 my-2 my-lg-0 ps-0 ps-lg-3"
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                >
                  Items
                </Nav.Link>
              </>
            ) : null}
          </Nav>
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <>
                <Nav.Item 
                  className="d-flex align-items-center me-lg-3 my-2 my-lg-0 ps-0 ps-lg-3"
                  style={{ 
                    color: '#ffffff', 
                    fontWeight: '500', 
                    opacity: 0.9,
                    whiteSpace: 'nowrap'
                  }}
                >
                  Welcome, {user?.username}!
                </Nav.Item>
                <Button 
                  onClick={handleLogout}
                  style={{ 
                    color: '#ffffff',
                    fontWeight: '500',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    transition: 'opacity 0.2s ease',
                    opacity: 0.9,
                    width: '100%',
                    textAlign: 'left',
                    paddingLeft: 0
                  }}
                  className="my-2 my-lg-0 ps-0 ps-lg-3"
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/login"
                  style={{ 
                    color: '#ffffff',
                    fontWeight: '500',
                    padding: '8px 16px',
                    transition: 'opacity 0.2s ease',
                    opacity: 0.9
                  }}
                  className="mx-lg-1 my-2 my-lg-0 ps-0 ps-lg-3"
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                >
                  Sign In
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/register"
                  style={{ 
                    color: '#ffffff',
                    fontWeight: '500',
                    padding: '8px 16px',
                    transition: 'opacity 0.2s ease',
                    opacity: 0.9
                  }}
                  className="mx-lg-1 my-2 my-lg-0 ps-0 ps-lg-3"
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                >
                  Create Account
                </Nav.Link>
              </>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}; 