"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLoader } from "@/hooks/useLoader";

const RouteLoader = () => {
  const { showLoader, hideLoader } = useLoader();
  const pathname = usePathname();
  const previousPathRef = useRef<string>(pathname);
  const isLoadingRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup any existing timeouts on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Only show loader if the route actually changed and we're not already loading
    if (pathname !== previousPathRef.current && !isLoadingRef.current) {
      isLoadingRef.current = true;
      
      let loadingMessage = "Loading page...";
      
      if (pathname.includes('/dashboard')) {
        loadingMessage = "Loading dashboard...";
      } else if (pathname.includes('/admin')) {
        loadingMessage = "Loading admin panel...";
      } else if (pathname.includes('/manager')) {
        loadingMessage = "Loading manager dashboard...";
      } else if (pathname.includes('/events')) {
        loadingMessage = "Loading events...";
      } else if (pathname.includes('/tickets')) {
        loadingMessage = "Loading tickets...";
      } else if (pathname.includes('/profile')) {
        loadingMessage = "Loading profile...";
      }

      showLoader(loadingMessage);

      // Hide loader after a short delay
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        hideLoader();
        isLoadingRef.current = false;
        previousPathRef.current = pathname;
      }, 500);
    }
  }, [pathname, showLoader, hideLoader]);

  return null;
};

export default RouteLoader;