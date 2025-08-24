import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../utils/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      setUser(response.user);
      toast.success('✅ Login successful!', {
        style: {
          background: '#ecfdf5',
          color: '#065f46',
          border: '1px solid #34d399',
          padding: '12px 16px',
          borderRadius: '12px',
        },
        icon: '🚀',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed', {
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #f87171',
          padding: '12px 16px',
          borderRadius: '12px',
        },
        icon: '⚠️',
      });
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const response = await authApi.register(data);
      setUser(response.user);
      toast.success('🎉 Registration successful!', {
        style: {
          background: '#eff6ff',
          color: '#1e40af',
          border: '1px solid #60a5fa',
          padding: '12px 16px',
          borderRadius: '12px',
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed', {
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #f87171',
          padding: '12px 16px',
          borderRadius: '12px',
        },
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      toast.success('👋 Logged out successfully', {
        style: {
          background: '#f0fdf4',
          color: '#166534',
          border: '1px solid #4ade80',
          padding: '12px 16px',
          borderRadius: '12px',
        },
      });
    } catch (error) {
      toast.error('Logout failed', {
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #f87171',
          padding: '12px 16px',
          borderRadius: '12px',
        },
      });
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
