"use client";

import { Button } from "@/components/ui/button";

export default function AdminSidebar() {
  return (
    <aside className="hidden md:flex md:w-60 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-4 font-bold text-lg text-admin-primary">Admin</div>
      <nav className="flex-1 p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          Dashboard
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          Users
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          Reports
        </Button>
      </nav>
    </aside>
  );
}
