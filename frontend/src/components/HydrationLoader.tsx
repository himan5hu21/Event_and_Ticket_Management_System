"use client";
import { useEffect } from "react";
import { useLoader } from "@/hooks/useLoader";

export default function HydrationLoader() {
  const { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    showLoader("Loading app...");
    const timer = setTimeout(() => {
      hideLoader();
    }, 600);
    return () => clearTimeout(timer);
  }, [showLoader, hideLoader]);
  return null;
}
