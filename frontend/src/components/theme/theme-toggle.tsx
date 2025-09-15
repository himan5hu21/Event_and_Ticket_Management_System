"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 rounded-full bg-admin-bg-secondary/50 hover:bg-admin-hover-bg border border-admin-header-border/50 transition-all duration-200"
      >
        <div className="h-4 w-4 animate-pulse bg-admin-text-muted rounded-full" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="group relative h-8 w-8 rounded-full bg-admin-bg-secondary/50 hover:bg-admin-hover-bg border border-admin-header-border/50 transition-all duration-200 hover:scale-105 hover:shadow-md"
        >
          {/* Light mode icon */}
          <Sun className="h-4 w-4 text-amber-500 scale-100 rotate-0 transition-all duration-300 ease-in-out dark:scale-0 dark:-rotate-90 dark:opacity-0" />
          
          {/* Dark mode icon */}
          <Moon className="absolute h-4 w-4 text-blue-400 scale-0 rotate-90 transition-all duration-300 ease-in-out dark:scale-100 dark:rotate-0 dark:opacity-100 opacity-0" />
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 dark:from-blue-500/20 dark:to-purple-500/20" />
          
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-40 bg-admin-bg-primary border-admin-header-border shadow-lg"
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2 cursor-pointer hover:bg-admin-hover-bg ${
            theme === "light" ? "bg-admin-hover-bg text-admin-text-primary" : "text-admin-text-secondary"
          }`}
        >
          <Sun className="h-4 w-4 text-amber-500" />
          <span>Light</span>
          {theme === "light" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-amber-500" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2 cursor-pointer hover:bg-admin-hover-bg ${
            theme === "dark" ? "bg-admin-hover-bg text-admin-text-primary" : "text-admin-text-secondary"
          }`}
        >
          <Moon className="h-4 w-4 text-blue-400" />
          <span>Dark</span>
          {theme === "dark" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-blue-400" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={`flex items-center gap-2 cursor-pointer hover:bg-admin-hover-bg ${
            theme === "system" ? "bg-admin-hover-bg text-admin-text-primary" : "text-admin-text-secondary"
          }`}
        >
          <Monitor className="h-4 w-4 text-admin-text-secondary" />
          <span>System</span>
          {theme === "system" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-admin-text-secondary" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
