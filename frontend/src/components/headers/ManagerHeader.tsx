"use client";

import { Button } from "@/components/ui/button";

export default function ManagerHeader() {
  return (
    <header className="sticky top-0 z-40 h-12 px-6 flex items-center justify-between bg-manager-primary text-primary-foreground shadow-sm">
      <h1 className="text-base font-semibold">Event Manager</h1>
      <Button variant="secondary" size="sm">
        Logout
      </Button>
    </header>
  );
}
