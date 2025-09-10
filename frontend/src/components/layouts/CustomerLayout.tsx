import CustomerHeader from "@/components/headers/CustomerHeader";
import CustomerFooter from "@/components/footers/CustomerFooter";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <CustomerHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <CustomerFooter />
    </div>
  );
}