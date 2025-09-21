"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLoading } from '@/contexts/LoadingContext';

interface RouteProtectionProps {
  children: ReactNode;
  allowedRoles?: ('customer' | 'admin' | 'event-manager')[];
  loaderComponent?: ReactNode;
  loaderClassName?: string;
}

const getDefaultPath = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'event-manager':
      return '/manager/dashboard';
    case 'customer':
    default:
      return '/';
  }
};

// List of public paths that don't require authentication
const PUBLIC_PATHS = ['/auth/signin', '/auth/signup', '/auth/forgot-password'];

export default function RouteProtection({ 
  children, 
  allowedRoles = [],
  loaderComponent = (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-lg border">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="text-lg font-medium">Loading...</span>
      </div>
    </div>
  ),
  loaderClassName = ''
}: RouteProtectionProps) {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { setLoading } = useLoading();
  
  // Show loading state while auth is being checked
  useEffect(() => {
    setLoading(isAuthLoading, 'Verifying session...');
    
    return () => {
      setLoading(false);
    };
  }, [isAuthLoading, setLoading]);

  useEffect(() => {
    if (isAuthLoading) return;

    // If it's a public path, no need to check auth
    if (PUBLIC_PATHS.includes(pathname)) return;

    // If user is not authenticated and trying to access protected route
    if (!isAuthenticated) {
      // Redirect to home if trying to access admin/manager dashboard
      if (pathname.startsWith('/admin') || pathname.startsWith('/manager')) {
        router.push('/');
      }
      return;
    }

    // If user is authenticated
    if (isAuthenticated && user) {
      const defaultPath = getDefaultPath(user.role);
      
      // Redirect to role-specific dashboard if on home page
      if (pathname === '/') {
        router.push(defaultPath);
        return;
      }

      // If trying to access a role-restricted route
      if (allowedRoles.length > 0) {
        const hasRequiredRole = allowedRoles.includes(user.role as any);
        
        // Redirect to role-specific dashboard if not authorized
        if (!hasRequiredRole) {
          router.push(defaultPath);
          return;
        }
      }

      // Redirect authenticated users away from auth pages
      if (pathname.startsWith('/auth')) {
        router.push(defaultPath);
        return;
      }
    }
  }, [user, isAuthLoading, isAuthenticated, allowedRoles, router, pathname]);

  // Show loading while checking auth state
  if (isAuthLoading) {
    return loaderComponent;
  }

  // If it's a public path, render children directly
  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  // If not authenticated, show home page
  if (!isAuthenticated) {
    if (pathname === '/') {
      return <>{children}</>;
    }
    return null; // Will trigger the redirect in the effect
  }

  // If user is authenticated but doesn't have the required role
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role as any)) {
    return null; // Will trigger the redirect in the effect
  }

  return <>{children}</>;
}