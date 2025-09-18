import AdminLayout from "@/components/layouts/AdminLayout";
import RouteProtection from "@/components/auth/RouteProtection";

export default function AdminPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteProtection allowedRoles={['admin']}>
      <AdminLayout>{children}</AdminLayout>
    </RouteProtection>
  );
}