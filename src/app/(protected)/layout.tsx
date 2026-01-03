'use client';

import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { AppHeader } from '@/components/topbar/app-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/auth-context';

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();

  // Show minimal loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      </div>
    );
  }

  // If no user, middleware will redirect - show nothing to avoid flash
  if (!user) {
    return null;
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '14rem', // Reduced from default 16rem
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar 
        userdata={{ 
          name: user.displayName || 'Admin', 
          email: user.email || 'admin@rps.com' 
        }} 
        variant="inset" 
      />
      <SidebarInset>
        <AppHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}