"use client";
// Authentication Context for ComplykOrt
// Manages user authentication state, login/logout, and token persistence

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User, LoginCredentials, ApiResponse } from '../services/api';

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<ApiResponse<{ user: User; token: string }>>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Initialize authentication state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const [me, roles] = await Promise.all([
            api.getCurrentUser(),
            api.getMyRoles().catch(() => ({ success: false }))
          ]);
          if (me.success && me.data) {
            const rolesByOrg = (roles.success && (roles as any).data?.rolesByOrg) || [];
            const mainRole = rolesByOrg?.[0]?.role || (me.data.email?.toLowerCase() === 'admin@acme.example.com' ? 'admin' : 'viewer');
            setUser({ ...me.data, role: mainRole, organizations: rolesByOrg } as any);
          } else {
            api.setToken(null);
          }
        } catch (err) {
          console.error('Auth initialization failed:', err);
          api.setToken(null);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.login(credentials);
      if (response.success && response.data) {
        // fetch roles to enrich user
        const roles = await api.getMyRoles().catch(() => ({ success: false } as any));
        const rolesByOrg = (roles.success && (roles as any).data?.rolesByOrg) || [];
        const mainRole = rolesByOrg?.[0]?.role || (response.data.user.email?.toLowerCase() === 'admin@acme.example.com' ? 'admin' : 'viewer');
        setUser({ ...response.data.user, role: mainRole, organizations: rolesByOrg } as any);
        setError(null);
      } else {
        setError(response.message || 'Login failed');
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      } as ApiResponse<{ user: User; token: string }>;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    api.logout();
    setUser(null);
    setError(null);
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use authentication context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Hook for protecting routes (redirects to login if not authenticated)
export function useRequireAuth() {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      // In a real app, you might want to redirect to login page
      console.warn('Authentication required');
    }
  }, [auth.isLoading, auth.isAuthenticated]);

  return auth;
}

export default AuthContext;
