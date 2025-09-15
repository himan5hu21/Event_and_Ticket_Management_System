"use client";

import { useEffect, useRef } from "react";
import { useLoader } from "@/hooks/useLoader";

const PageLoader = () => {
  const { hideLoader } = useLoader();
  const hasLoaded = useRef(false);

  useEffect(() => {
    // Only run once when component mounts
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      
      // Hide loader when page is fully loaded
      const timer = setTimeout(() => {
        hideLoader();
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [hideLoader]);

  return null;
};

export default PageLoader;
