"use client";

import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Ticket, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Shield,
  ChevronDown,
  Clock,
  CheckCircle2,
  DollarSign,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDashboardStats } from '@/hooks/api/analytics';
import { useMemo } from 'react';

const navigationItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    submenu: [
      { title: "All Users", href: "/admin/users" },
      { title: "Event Managers", href: "/admin/users?role=event-manager" },
    ]
  },
  {
    title: "Event Management",
    href: "/admin/events",
    icon: Calendar,
    submenu: [
      { title: "All Events", href: "/admin/events" },
      { title: "Verify Events", href: "/admin/events/verify" },
      { title: "Event Categories", href: "/admin/events/categories" },
    ]
  },
  {
    title: "Ticket Management",
    href: "/admin/tickets",
    icon: Ticket,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    submenu: [
      { title: "Revenue Reports", href: "/admin/analytics/revenue" },
      { title: "User Analytics", href: "/admin/analytics/users" },
      { title: "Event Performance", href: "/admin/analytics/events" },
    ]
  },
  {
    title: "System Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();
  
  // Check if a submenu item is active
  const isSubmenuItemActive = useMemo(() => (subItemHref: string) => {
    // Exact path match
    if (subItemHref === pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')) {
      return true;
    }

    // Handle user management specific logic
    if (pathname === '/admin/users') {
      const url = new URL(subItemHref, 'http://dummy.com');
      const roleParam = url.searchParams.get('role');
      const currentRole = searchParams?.get('role');
      
      // For 'All Users' - should only be active when there's no role parameter
      if (subItemHref === '/admin/users' && !currentRole) {
        return true;
      }
      
      // For 'Event Managers' - should only be active when role=event-manager
      if (roleParam === 'event-manager' && currentRole === 'event-manager') {
        return true;
      }
      
      // If we have a role parameter but it's not 'event-manager', neither should be active
      if (currentRole && currentRole !== 'event-manager') {
        return false;
      }
    }
    
    return false;
  }, [pathname, searchParams]);

  // Check if a main navigation item is active
  const getIsActiveItem = useMemo(() => (item: typeof navigationItems[0]) => {
    if (item.href === pathname) return true;
    if (item.submenu?.some(subItem => isSubmenuItemActive(subItem.href))) {
      return true;
    }
    return false;
  }, [pathname, isSubmenuItemActive]);
  
  // Format currency
  const formatCurrency = useMemo(() => (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  return (
    <aside className="hidden md:flex md:w-72 flex-col bg-admin-sidebar-bg border-r border-admin-sidebar-border h-full transition-all duration-200 ease-in-out shadow-lg">
      {/* Logo/Brand */}
      <div className="shrink-0 p-6 border-b border-admin-sidebar-border bg-gradient-to-r from-admin-sidebar-bg to-admin-sidebar-bg/90">
        <Link href="/admin/dashboard" className="block">
          <div className="flex items-center space-x-3 group">
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-admin-text-primary">EventFlow</h1>
          </div>
        </Link>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
        <nav className="px-3">
          <div className="px-3">
            {/* <h3 className="text-xs font-semibold text-admin-text-muted uppercase tracking-wider mb-3 px-1">Main</h3> */}
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const isItemActive = getIsActiveItem(item);
                
                return (
                  <div key={item.title} className="group relative">
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between h-11 px-4 text-sm font-medium transition-all duration-200 rounded-lg",
                          isItemActive
                            ? "bg-admin-active-bg/90 text-admin-text-primary shadow-sm hover:bg-admin-active-bg" 
                            : "text-admin-text-secondary hover:bg-admin-hover-bg hover:text-admin-text-primary"
                        )}
                      >
                        <div className="flex items-center">
                          <div className={cn(
                            "p-1.5 rounded-lg mr-3 transition-colors",
                            isItemActive
                              ? "bg-primary/10 text-primary" 
                              : "bg-admin-bg-accent/50 text-admin-text-muted group-hover:bg-primary/5"
                          )}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          <span>{item.title}</span>
                        </div>
                        {item.submenu && (
                          <ChevronDown className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isItemActive ? "rotate-180" : ""
                          )} />
                        )}
                      </Button>
                    </Link>
                    
                    {/* Submenu */}
                    {item.submenu && (
                      <div 
                        className={cn(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          isItemActive ? "max-h-96" : "max-h-0"
                        )}
                      >
                        <div className={cn(
                          "mt-1 space-y-1 pl-11 py-1",
                          isItemActive ? "block" : "hidden"
                        )}>
                          {item.submenu.map((subItem) => {
                            const isSubActive = isSubmenuItemActive(subItem.href);
                            return (
                              <Link key={subItem.href} href={subItem.href}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    "w-full justify-start h-9 px-3.5 text-xs transition-all duration-200 rounded-md",
                                    isSubActive 
                                      ? "bg-primary/5 text-primary font-medium border border-primary/10" 
                                      : "text-admin-text-muted hover:bg-admin-hover-bg hover:text-admin-text-primary"
                                  )}
                                >
                                  <span className={cn(
                                    "w-1.5 h-1.5 rounded-full mr-2.5 transition-all",
                                    isSubActive ? "bg-primary" : "bg-admin-border group-hover:bg-primary/50"
                                  )} />
                                  {subItem.title}
                                </Button>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* Quick Stats - Fixed at bottom */}
      <div className="shrink-0 p-4 border-t border-admin-sidebar-border bg-gradient-to-t from-admin-sidebar-bg/90 to-admin-sidebar-bg/70 backdrop-blur-sm">
        <div className="bg-admin-bg-accent/30 rounded-xl p-4 border border-admin-border/30 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-admin-text-muted uppercase tracking-wider">System Status</h3>
            {isLoadingStats && (
              <span className="text-xs text-admin-text-muted">Updating...</span>
            )}
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-admin-bg-accent/40">
            <span className="text-sm text-admin-text-secondary flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 mr-2 text-amber-500" />
                Pending Verifications
              </span>
              <span className="font-medium bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded text-xs">
                {isLoadingStats ? '...' : stats?.pendingVerifications?.toLocaleString() || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-admin-bg-accent/40">
            <span className="text-sm text-admin-text-secondary flex items-center">
                <Clock className="w-3.5 h-3.5 mr-2 text-blue-500" />
                Events Today
              </span>
              <span className="font-medium bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded text-xs">
                {isLoadingStats ? '...' : stats?.eventsToday?.toLocaleString() || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-admin-bg-accent/40">
              <span className="text-admin-text-secondary flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-green-500" />
                Today's Orders
              </span>
              <span className="font-medium bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-xs">
                {isLoadingStats ? '...' : stats?.todayOrders?.toLocaleString() || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-admin-bg-accent/40">
              <span className="text-admin-text-secondary flex items-center">
                <DollarSign className="w-3.5 h-3.5 mr-2 text-purple-500" />
                Total Revenue
              </span>
              <span className="font-medium bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded text-xs">
                {isLoadingStats ? '...' : formatCurrency(stats?.totalRevenue || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </aside>
  );
}
