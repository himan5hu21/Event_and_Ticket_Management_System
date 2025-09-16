import { ReactNode } from "react";
import ManagerSidebar from "@/components/sidebars/ManagerSidebar";
import ManagerHeader from "@/components/headers/ManagerHeader";
import ManagerFooter from "@/components/footers/ManagerFooter";

interface LayoutProps {
  children: ReactNode;
}

export default function ManagerLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <ManagerSidebar />

      {/* Main Area */}
      <div className="flex flex-col flex-1">
        <ManagerHeader />
        <main className="flex-1 p-6 overflow-auto bg-admin-bg-secondary">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <ManagerFooter />
      </div>
    </div>
  );
}
