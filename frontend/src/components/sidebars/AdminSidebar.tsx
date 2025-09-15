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
  CheckCircle,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
      { title: "Verify Users", href: "/admin/users/verify" },
      { title: "Event Managers", href: "/admin/users/managers" },
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

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-admin-sidebar-bg border-r border-admin-sidebar-border">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-admin-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-admin-text-primary">Admin Panel</h2>
            <p className="text-xs text-admin-text-muted">Event Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <div key={item.title}>
              <Link href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-10 px-3 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-admin-active-bg text-admin-text-primary hover:bg-admin-active-bg/90" 
                      : "text-admin-text-primary hover:bg-admin-hover-bg"
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
              
              {/* Submenu */}
              {item.submenu && isActive && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.submenu.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link key={subItem.href} href={subItem.href}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start h-8 px-3 text-xs transition-colors",
                            isSubActive 
                              ? "bg-admin-bg-accent text-admin-text-primary" 
                              : "text-admin-text-secondary hover:bg-admin-hover-bg hover:text-admin-text-primary"
                          )}
                        >
                          {subItem.title}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-admin-sidebar-border">
        <div className="bg-admin-bg-secondary rounded-lg p-3">
          <h3 className="text-sm font-medium text-admin-text-primary mb-2">Quick Stats</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-admin-text-secondary">Pending Verifications</span>
              <span className="font-medium text-warning">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-admin-text-secondary">Active Events</span>
              <span className="font-medium text-success">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-admin-text-secondary">Total Users</span>
              <span className="font-medium text-primary">1,234</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
