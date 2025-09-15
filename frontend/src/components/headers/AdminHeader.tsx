"use client";

import { Button } from "@/components/ui/button";
import { Bell, Search, Settings, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/theme/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminHeader() {

  const {logout} = useAuth();

  const handleLogout = async () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        window.location.href = '/';
      },
    });
  };

  return (
    <header className="sticky top-0 z-40 h-14 px-6 flex items-center justify-between bg-admin-header-bg border-b border-admin-header-border shadow-sm">
      {/* Left side - Search */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-admin-text-muted h-4 w-4" />
          <Input
            placeholder="Search users, events, orders..."
            className="pl-10 h-9 bg-admin-bg-secondary border-admin-header-border focus:bg-admin-bg-primary text-admin-text-primary placeholder:text-admin-text-muted"
          />
        </div>
      </div>

      {/* Right side - Actions and Profile */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative hover:bg-admin-hover-bg">
          <Bell className="h-5 w-5 text-admin-text-secondary" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-admin-notification-bg rounded-full text-xs text-white flex items-center justify-center">
            3
          </span>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="sm" className="hover:bg-admin-hover-bg">
          <Settings className="h-5 w-5 text-admin-text-secondary" />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full p-0 overflow-hidden hover:bg-admin-hover-bg">
              <div className="h-full w-full rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
