import { ReactNode } from "react";
import AdminSidebar from "../sidebars/AdminSidebar";
import AdminHeader from "../headers/AdminHeader";
import AdminFooter from "../footers/AdminFooter";

interface LayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Area */}
      <div className="flex flex-col flex-1">
        <AdminHeader />
        <main className="flex-1 p-6">{children}</main>
        <AdminFooter />
      </div>
    </div>
  );
}
