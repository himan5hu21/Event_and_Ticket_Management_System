"use client";

import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  BarChart3, 
  Settings,
  CalendarCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/manager/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Events",
    href: "/manager/events",
    icon: Calendar,
    submenu: [
      { title: "All Events", href: "/manager/events" },
      { title: "Create Event", href: "/manager/events/create" },
      { title: "Drafts", href: "/manager/events/drafts" },
    ]
  },
  {
    title: "Event Types",
    href: "/manager/event-types",
    icon: CalendarCheck,
  },
  {
    title: "Tickets",
    href: "/manager/tickets",
    icon: Ticket,
  },
  {
    title: "Attendees",
    href: "/manager/attendees",
    icon: Users,
  },
  {
    title: "Analytics",
    href: "/manager/analytics",
    icon: BarChart3,
    submenu: [
      { title: "Event Analytics", href: "/manager/analytics/events" },
      { title: "Attendee Insights", href: "/manager/analytics/attendees" },
      { title: "Revenue Reports", href: "/manager/analytics/revenue" },
    ]
  },
  {
    title: "Settings",
    href: "/manager/settings",
    icon: Settings,
  },
];

export default function ManagerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-admin-sidebar-bg border-r border-admin-sidebar-border">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-admin-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <CalendarCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-admin-text-primary">Event Manager</h2>
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
                    "w-full justify-start h-10 text-sm",
                    isActive 
                      ? "bg-admin-accent text-admin-accent-foreground hover:bg-admin-accent/90" 
                      : "text-admin-text-secondary hover:bg-admin-hover-bg hover:text-admin-text-primary"
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
              
              {/* Submenu */}
              {item.submenu && isActive && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.submenu.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link key={subItem.href} href={subItem.href}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-xs pl-8 h-8",
                            isSubActive 
                              ? "text-admin-accent hover:bg-admin-accent/10" 
                              : "text-admin-text-muted hover:bg-admin-hover-bg hover:text-admin-text-primary"
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
    </aside>
  );
}
