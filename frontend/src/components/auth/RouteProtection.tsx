"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import Loader from '@/components/ui/loader';

interface RouteProtectionProps {
  children: ReactNode;
  allowedRoles?: ('customer' | 'admin' | 'event-manager')[];
  redirectTo?: string;
  requireAuth?: boolean;
}

export default function RouteProtection({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/auth/signin',
  requireAuth = true 
}: RouteProtectionProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // If user is authenticated but doesn't have required role
    if (isAuthenticated && allowedRoles.length > 0 && user) {
      if (!allowedRoles.includes(user.role as any)) {
        // Redirect based on user role
        switch (user.role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'event-manager':
            router.push('/manager/dashboard');
            break;
          case 'customer':
            router.push('/');
            break;
          default:
            router.push(redirectTo);
        }
        return;
      }
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, redirectTo, requireAuth, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8" />
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If user doesn't have required role
  if (isAuthenticated && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role as any)) {
    return null;
  }

  return <>{children}</>;
}
