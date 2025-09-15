"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Ticket, Menu } from "lucide-react";
import { useState } from "react";

export default function CustomerHeader() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        window.location.href = '/';
      },
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo / Brand */}
        <Link href="/" className="text-xl font-bold text-customer-primary">
          Eventify
        </Link>

        {/* Navigation links (desktop) */}
        <nav className="hidden md:flex items-center space-x-6 font-medium">
          <Link href="/events" className="hover:text-customer-primary transition-colors">
            Events
          </Link>
          {isAuthenticated && (
            <Link href="/tickets" className="hover:text-customer-primary transition-colors">
              My Tickets
            </Link>
          )}
          <Link href="/about" className="hover:text-customer-primary transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-customer-primary transition-colors">
            Contact
          </Link>
        </nav>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Right side: theme toggle + user dropdown */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          
          {isLoading ? (
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 overflow-hidden">
                  <div className="h-full w-full rounded-full bg-customer-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {user.role} {user.verified ? '✓' : '(Pending)'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tickets" className="cursor-pointer">
                    <Ticket className="mr-2 h-4 w-4" />
                    <span>My Tickets</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link 
                href="/auth/signin" 
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-customer-primary transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                className="px-4 py-2 text-sm font-medium bg-customer-primary text-white rounded-md hover:bg-customer-primary/90 transition-colors shadow-sm hover:shadow-md"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="px-6 py-4 space-y-3">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/events" 
                className="text-foreground hover:text-customer-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>
              {isAuthenticated && (
                <Link 
                  href="/tickets" 
                  className="text-foreground hover:text-customer-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Tickets
                </Link>
              )}
              <Link 
                href="/about" 
                className="text-foreground hover:text-customer-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="text-foreground hover:text-customer-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
            
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <ThemeToggle />
                {isAuthenticated && user ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-foreground">{user.name}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLogout}
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link 
                      href="/auth/signin" 
                      className="px-3 py-1 text-sm font-medium text-foreground hover:text-customer-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="px-3 py-1 text-sm font-medium bg-customer-primary text-white rounded-md hover:bg-customer-primary/90 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}