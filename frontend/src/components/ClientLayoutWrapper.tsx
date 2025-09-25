"use client";
import React, { Suspense } from "react";
import GlobalLoader from "@/components/GlobalLoader";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<GlobalLoader />}>
      {children}
    </Suspense>
  );
}
