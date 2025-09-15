"use client";

import React, { createContext, useContext } from 'react';
import { useMe, useLogin, useLogout } from '@/hooks/api/auth';
import { User } from '@/lib/schemas';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: ReturnType<typeof useLogin>;
  logout: ReturnType<typeof useLogout>;
  refetch: () => void;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: meData, isLoading, refetch, error } = useMe();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const user = meData?.success ? meData.data : null;
  
  // Don't consider user authenticated if there's a 401 error
  const isAuthenticated = !!user && !error;

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated,
    login: loginMutation,
    logout: logoutMutation,
    refetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
