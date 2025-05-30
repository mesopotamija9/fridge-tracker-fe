import { createContext, useContext, useState, useEffect } from 'react';
import type { AuthTokens, User } from '../types/auth';
import { authApi } from '../services/api';
import { isApiError } from '../types/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (tokens: AuthTokens) => void;
  logout: () => void;
  getAccessToken: () => string | null;
  refreshTokens: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);

  useEffect(() => {
    const storedTokens = localStorage.getItem('tokens');
    const storedUsername = localStorage.getItem('username');
    if (storedTokens) {
      const parsedTokens = JSON.parse(storedTokens) as AuthTokens;
      setTokens(parsedTokens);
      setIsAuthenticated(true);
      setUser({ username: storedUsername || 'User' });
    }
  }, []);

  const login = (newTokens: AuthTokens) => {
    localStorage.setItem('tokens', JSON.stringify(newTokens));
    const username = localStorage.getItem('username');
    setTokens(newTokens);
    setIsAuthenticated(true);
    setUser({ username: username || 'User' });
  };

  const logout = () => {
    localStorage.removeItem('tokens');
    localStorage.removeItem('username');
    setTokens(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  const getAccessToken = () => {
    return tokens?.accessToken || null;
  };

  const refreshTokens = async () => {
    try {
      if (!tokens?.refreshToken) {
        logout();
        return null;
      }

      const response = await authApi.refreshToken(tokens.refreshToken);

      if (isApiError(response.data)) {
        console.error('Refresh token API returned an error:', response.data.message);
        logout();
        return null;
      }

      if (!response.data.tokens || !response.data.tokens.accessToken || !response.data.tokens.refreshToken) {
        console.error('Refresh response missing tokens structure:', response.data);
        logout();
        return null;
      }

      const newTokens = response.data.tokens;
      
      localStorage.setItem('tokens', JSON.stringify(newTokens));
      
      await new Promise<void>((resolve) => {
        setTokens(newTokens);
        setIsAuthenticated(true);
        setTimeout(resolve, 0);
      });
      
      return newTokens.accessToken;
    } catch (error) {
      console.error('Exception during token refresh process:', error);
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout,
      getAccessToken,
      refreshTokens
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 