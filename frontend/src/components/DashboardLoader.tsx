"use client";

import { useEffect } from "react";
import { useLoader } from "@/hooks/useLoader";

interface DashboardLoaderProps {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const DashboardLoader: React.FC<DashboardLoaderProps> = ({
  isLoading = false,
  loadingText = "Loading dashboard...",
  children
}) => {
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    if (isLoading) {
      showLoader(loadingText);
    } else {
      hideLoader();
    }

    return () => {
      hideLoader();
    };
  }, [isLoading, loadingText, showLoader, hideLoader]);

  return <>{children}</>;
};

export default DashboardLoader;
