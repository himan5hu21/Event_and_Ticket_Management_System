import { ReactNode } from "react";
import ManagerSidebar from "../sidebars/ManagerSidebar";
import ManagerHeader from "../headers/ManagerHeader";
import ManagerFooter from "../footers/ManagerFooter";
interface LayoutProps {
  children: ReactNode;
}

export default function ManagerLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <ManagerSidebar />

      {/* Main Area */}
      <div className="flex flex-col flex-1">
        <ManagerHeader />
        <main className="flex-1 p-6">{children}</main>
        <ManagerFooter />
      </div>
    </div>
  );
}
