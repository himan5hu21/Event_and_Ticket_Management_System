"use client";

import { ReactNode, Suspense } from "react";
import AdminSidebar from "../sidebars/AdminSidebar";
import AdminHeader from "../headers/AdminHeader";
import AdminFooter from "../footers/AdminFooter";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}


export default function AdminLayout({ children }: LayoutProps) {

  const contentLoader = (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Loading...</span>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Fixed Sidebar */}
      <div className="h-full">
        <AdminSidebar />
      </div>

      {/* Scrollable Main Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Fixed Header */}
        <div className="shrink-0 z-10">
          <AdminHeader />
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-admin-bg-secondary relative">
          <main className="p-6 min-h-full">
            <div className="max-w-7xl mx-auto h-full">
                 {/* Only the page content is lazy-loaded */}
                 <Suspense fallback={contentLoader}>{children}</Suspense>
            </div>
          </main>
          
          {/* Footer */}
          <div className="shrink-0">
            <AdminFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
