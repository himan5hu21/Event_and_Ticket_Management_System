"use client";

import React from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { FullScreenLoader } from "@/components/ui/loader";

const GlobalLoader: React.FC = () => {
  const { isLoading, loadingText } = useLoading();

  return <FullScreenLoader isVisible={isLoading} text={loadingText} variant="spinner" />;
};

export default GlobalLoader;
