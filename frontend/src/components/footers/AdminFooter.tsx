export default function AdminFooter() {
  return (
    <footer className="h-10 flex items-center justify-center text-xs bg-muted text-muted-foreground border-t border-border">
      © {new Date().getFullYear()} Admin Panel. All rights reserved.
    </footer>
  );
}
