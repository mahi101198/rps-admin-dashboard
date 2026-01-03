'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import React from 'react';
import { LogoutConfirmationDialog } from '@/components/sidebar/logout-confirmation-dialog';

export default function SidebarUser({
  user,
}: {
  user: {
    name: string;
    email: string;
  };
}) {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <SidebarMenu className="pb-1 rounded-md">
        <SidebarMenuItem className="flex items-center gap-1.5">
          <Avatar className="h-7 w-7 rounded-md">
            <AvatarImage src="user-avatar.svg" className="" alt="User Avatar" />
            <AvatarFallback className="rounded-md bg-sidebar-accent text-xs">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-medium text-sm">{user.name}</span>
            <span className="truncate text-[0.65rem]">{user.email}</span>
          </div>
          <Button
            size="icon"
            className="size-7 bg-transparent text-destructive hover:text-destructive group-data-[collapsible=icon]:opacity-0 p-1"
            variant="outline"
            onClick={() => setIsLogoutDialogOpen(true)}
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>

      <LogoutConfirmationDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        onLogout={handleLogout}
      />
    </>
  );
}