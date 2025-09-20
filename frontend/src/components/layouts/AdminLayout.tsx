import { ReactNode } from "react";
import AdminSidebar from "../sidebars/AdminSidebar";
import AdminHeader from "../headers/AdminHeader";
import AdminFooter from "../footers/AdminFooter";
import PageLoader from "../PageLoader";

interface LayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Fixed Sidebar */}
      <div className="h-full">
        <AdminSidebar />
      </div>

      {/* Scrollable Main Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0">
          <AdminHeader />
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-admin-bg-secondary">
          <main className="p-6 min-h-full">
            <div className="max-w-7xl mx-auto h-full">
              <PageLoader />
              {children}
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
