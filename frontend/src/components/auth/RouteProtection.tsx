"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';

interface RouteProtectionProps {
  children: ReactNode;
  allowedRoles?: ('customer' | 'admin' | 'event-manager')[];
  loaderComponent?: ReactNode;
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

// Public paths that anyone can access
const PUBLIC_PATHS = ['/', '/events', '/auth/signin', '/auth/signup', '/auth/forgot-password'];

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
}: RouteProtectionProps) {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { setLoading } = useLoading();

  // Show global loading while auth is being checked
  useEffect(() => {
    setLoading(isAuthLoading, 'Verifying session...');
    return () => setLoading(false);
  }, [isAuthLoading, setLoading]);

  useEffect(() => {
    if (isAuthLoading) return;

    // Allow public paths without auth
    if (PUBLIC_PATHS.includes(pathname)) {
      // Optional: redirect logged-in admins/managers from '/' or '/events' to their dashboard
      if (isAuthenticated && user) {
        const role = user.role as 'customer' | 'admin' | 'event-manager';
      
        if (role === 'admin' && pathname === '/') {
          router.push('/admin/dashboard');
        }
      
        if (role === 'event-manager' && pathname === '/') {
          router.push('/manager/dashboard');
        }
      }
      
      return;
    }

    // If not authenticated, redirect to home
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // If route is role-restricted
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role as any)) {
      router.push(getDefaultPath(user.role));
      return;
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith('/auth') && user) {
      router.push(getDefaultPath(user.role));
      return;
    }

  }, [user, isAuthLoading, isAuthenticated, allowedRoles, router, pathname]);

  // Show loader while checking auth state
  if (isAuthLoading) return loaderComponent;

  return <>{children}</>;
}
