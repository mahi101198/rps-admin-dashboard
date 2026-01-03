'use client';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

export default function SidebarItems({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="py-1">
      {/* <SidebarMenu className="mb-2">
        <SidebarMenuItem className="flex items-center gap-2">
          <AddProductDialog />
        </SidebarMenuItem>
      </SidebarMenu> */}
      <SidebarGroupLabel className="text-xs py-1">Dashboard</SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">
        {items.map((item) => (
            <Link key={item.title} href={item.url}>
              <SidebarMenuItem key={item.title} className="py-0.5">
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    'cursor-pointer transition-colors h-8 text-xs',
                    pathname === item.url && 'bg-sidebar-accent text-sidebar-accent-foreground'
                  )}
                >
                  {item.icon && <item.icon className='scale-100' />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}