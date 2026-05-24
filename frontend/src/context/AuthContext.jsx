import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(
    localStorage.getItem('token')
  );

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          setUser(data.user);

          setToken(storedToken);
        } else {
          localStorage.removeItem('token');

          setToken(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);

        localStorage.removeItem('token');

        setToken(null);
      }
    }

    setLoading(false);
  };

  // EMAIL LOGIN
  const login = async (email, password) => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);

        setToken(data.token);

        setUser(data.user);

        return {
          success: true,
          user: data.user,
        };
      } else {
        return {
          success: false,
          message: data.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error',
      };
    }
  };

  // REGISTER
  const register = async (
    username,
    email,
    password
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            username,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);

        setToken(data.token);

        setUser(data.user);

        return {
          success: true,
          user: data.user,
        };
      } else {
        return {
          success: false,
          message: data.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error',
      };
    }
  };

  // GOOGLE LOGIN
  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(
        auth,
        provider
      );

      const firebaseToken =
        await result.user.getIdToken();

      const response = await fetch(
        `${API_URL}/api/auth/google`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            token: firebaseToken,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);

        setToken(data.token);

        setUser(data.user);

        return {
          success: true,
          user: data.user,
        };
      } else {
        return {
          success: false,
          message: data.message,
        };
      }
    } catch (error) {
      console.error(error);

      return {
        success: false,
        message: 'Google sign-in failed',
      };
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('token');

    setToken(null);

    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    googleLogin,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};