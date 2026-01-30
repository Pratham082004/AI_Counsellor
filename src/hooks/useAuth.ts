import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  sub: string;
  email: string;
  stage: string;
  exp: number;
  iat: number;
}

export function useAuth() {
  const navigate = useNavigate();

  const getToken = useCallback(() => {
    return localStorage.getItem('access_token');
  }, []);

  const getUser = useCallback((): DecodedToken | null => {
    const token = getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        logout();
        return null;
      }
      return decoded;
    } catch (error) {
      console.error('Failed to decode token:', error);
      logout();
      return null;
    }
  }, [getToken]);

  const setToken = useCallback((token: string) => {
    localStorage.setItem('access_token', token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    navigate('/login', { replace: true });
  }, [navigate]);

  const isAuthenticated = useCallback(() => {
    return getUser() !== null;
  }, [getUser]);

  return {
    getToken,
    getUser,
    setToken,
    logout,
    isAuthenticated,
  };
}
