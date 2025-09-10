import CustomerLayout from "@/components/layouts/CustomerLayout";

export default function CustomerPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerLayout>{children}</CustomerLayout>;
}