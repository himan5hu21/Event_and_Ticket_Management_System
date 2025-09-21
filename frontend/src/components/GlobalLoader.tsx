"use client";

import React from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { Loader2 } from "lucide-react";

const GlobalLoader: React.FC = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 p-6 bg-card rounded-lg shadow-xl border">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm font-medium text-foreground">
          Loading...
        </span>
      </div>
    </div>
  );
};

export default GlobalLoader;
