import ManagerLayout from "@/components/layouts/ManagerLayout";
import RouteProtection from "@/components/auth/RouteProtection";

export default function ManagerPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteProtection allowedRoles={['event-manager']}>
      <ManagerLayout>{children}</ManagerLayout>
    </RouteProtection>
  );
}