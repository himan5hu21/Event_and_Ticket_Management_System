export default function ManagerFooter() {
  return (
    <footer className="h-10 flex items-center justify-between px-6 border-t border-admin-border text-xs text-admin-text-muted bg-admin-bg-primary">
      <div>© {new Date().getFullYear()} Event Management System</div>
      <div className="flex items-center space-x-4">
        <span>v1.0.0</span>
      </div>
    </footer>
  );
}
