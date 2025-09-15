import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

/**
 * Dashboard layout component that provides sidebar navigation structure
 * @param props Component properties
 * @param props.children Child components to render in the main content area
 * @returns JSX element containing the dashboard layout with sidebar
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
