"use client";

import Link from "next/link";
// import UserDropdown from "@/components/common/UserDropdown"; // optional if customers have dropdown
import ThemeToggle from "@/components/theme/theme-toggle";

export default function CustomerHeader() {

  const isAuthenticated = false;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo / Brand */}
        <Link href="/" className="text-xl font-bold text-customer-primary">
          Eventify
        </Link>

        {/* Navigation links (desktop) */}
        <nav className="hidden md:flex items-center space-x-6 font-medium">
          <Link href="/events" className="hover:text-customer-primary">
            Events
          </Link>
          <Link href="/tickets" className="hover:text-customer-primary">
            My Tickets
          </Link>
          <Link href="/about" className="hover:text-customer-primary">
            About
          </Link>
          <Link href="/contact" className="hover:text-customer-primary">
            Contact
          </Link>
        </nav>

        {/* Right side: theme toggle + user dropdown */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
{isAuthenticated ? (
            // <UserDropdown /> // Show user dropdown when authenticated
            <div>Hello</div>
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
                className="px-4 py-2 text-sm font-medium bg-customer-primary text-foreground rounded-md hover:bg-customer-primary transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-customer-primary"
              >
                Sign Up
              </Link>
            </div>
          )}
          {/* <UserDropdown /> optional */}
        </div>
      </div>
    </header>
  );
}