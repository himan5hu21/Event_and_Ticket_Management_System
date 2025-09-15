import { ReactNode } from "react";
import AdminSidebar from "../sidebars/AdminSidebar";
import AdminHeader from "../headers/AdminHeader";
import AdminFooter from "../footers/AdminFooter";

interface LayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Area */}
      <div className="flex flex-col flex-1">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto bg-admin-bg-secondary">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
