"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "pulse";
  className?: string;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = "md",
  variant = "spinner",
  className,
  text
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  if (variant === "spinner") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
        <div
          className={cn(
            "animate-spin rounded-full border-2 border-muted border-t-primary",
            sizeClasses[size]
          )}
        />
        {text && (
          <p className={cn("text-muted-foreground", textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
        <div className="flex space-x-1">
          <div className={cn("animate-bounce rounded-full bg-primary", size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4")} style={{ animationDelay: "0ms" }} />
          <div className={cn("animate-bounce rounded-full bg-primary", size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4")} style={{ animationDelay: "150ms" }} />
          <div className={cn("animate-bounce rounded-full bg-primary", size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4")} style={{ animationDelay: "300ms" }} />
        </div>
        {text && (
          <p className={cn("text-muted-foreground", textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
        <div
          className={cn(
            "animate-pulse rounded-full bg-primary",
            sizeClasses[size]
          )}
        />
        {text && (
          <p className={cn("text-muted-foreground animate-pulse", textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  return null;
};

// Full-screen overlay loader
interface FullScreenLoaderProps {
  isVisible: boolean;
  text?: string;
  variant?: "spinner" | "dots" | "pulse";
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  isVisible,
  text = "Loading...",
  variant = "spinner"
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="rounded-lg border bg-card p-8 shadow-lg">
        <Loader size="lg" variant={variant} text={text} />
      </div>
    </div>
  );
};

// Inline loader for buttons and small spaces
export const InlineLoader: React.FC<{ size?: "sm" | "md"; className?: string }> = ({
  size = "sm",
  className
}) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-current",
        size === "sm" ? "h-4 w-4" : "h-5 w-5",
        className
      )}
    />
  );
};

export default Loader;
