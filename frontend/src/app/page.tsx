import CustomerLayout from "@/components/layouts/CustomerLayout";

export default function HomePage() {
  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-customer-primary mb-6">Welcome to Eventify</h1>
        <p className="text-muted-foreground">Discover amazing events and book your tickets seamlessly.</p>
        {/* Add more content here */}
      </div>
    </CustomerLayout>
  );
}
