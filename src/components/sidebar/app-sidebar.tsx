'use client';

import * as React from 'react';

import SidebarItems from './sidebar-items';
import SidebarTitle from './sidebar-title';
import SidebarUser from './sidebar-user';
import { 
  Package, 
  RectangleEllipsisIcon, 
  Store, 
  Users, 
  FolderTree, 
  CreditCard, 
  ShoppingCart, 
  Star, 
  Ticket, 
  UserCheck, 
  Settings, 
  Heart, 
  BarChart3, 
  Gift,
  Home,
  Smartphone
} from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

const data = {
  navItems: [
    {
      title: 'Dashboard',
      url: '/',
      icon: BarChart3,
      isActive: true,
    },
    {
      title: 'Orders',
      url: '/orders',
      icon: Store,
    },
    {
      title: 'Products',
      url: '/products',
      icon: Package,
    },
    {
      title: 'Home Sections',
      url: '/home-sections',
      icon: Home,
    },
    {
      title: 'Categories',
      url: '/categories',
      icon: FolderTree,
    },
    {
      title: 'Users',
      url: '/users',
      icon: Users,
    },
    {
      title: 'Payments',
      url: '/payments',
      icon: CreditCard,
    },
    // {
    //   title: 'Payments',
    //   url: '/payments',
    //   icon: CreditCard,
    // },
    {
      title: 'Carts',
      url: '/carts',
      icon: ShoppingCart,
    },
    {
      title: 'Reviews',
      url: '/reviews',
      icon: Star,
    },
    {
      title: 'Coupons',
      url: '/coupons',
      icon: Ticket,
    },
    {
      title: 'Referrals',
      url: '/referrals',
      icon: UserCheck,
    },
    {
      title: 'Banners',
      url: '/banners',
      icon: RectangleEllipsisIcon,
    },
    {
      title: 'Wishlists',
      url: '/wishlists',
      icon: Heart,
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
    },
    {
      title: 'Play Store',
      url: '/playstore',
      icon: Smartphone,
    },
  ],
};

type UserData = {
  name: string;
  email: string;
};

export function AppSidebar({ userdata, ...props }: React.ComponentProps<typeof Sidebar> & { userdata: UserData }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarTitle title="RPS Stationery" subtitle="Admin Portal" logoPath="/logo.png" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarItems items={data.navItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser user={userdata} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}