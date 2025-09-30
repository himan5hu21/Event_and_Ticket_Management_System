import { lazy, Suspense } from 'react';
// import AdminLayout from "@/components/layouts/AdminLayout";
import RouteProtection from "@/components/auth/RouteProtection";
import { Loader2 } from 'lucide-react';

const AdminLayout = lazy(() => import("@/components/layouts/AdminLayout"));

export default function AdminPageLayout({ children }: { children: React.ReactNode }) {
  // Custom loader component that will be shown in the content area
  const contentLoader = (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Loading...</span>
    </div>
  );

  return (
    <RouteProtection 
      allowedRoles={['admin']}
      loaderComponent={contentLoader}
    >
      <Suspense fallback={contentLoader}>
        <AdminLayout>{children}</AdminLayout>
      </Suspense>
    </RouteProtection>
  );
}