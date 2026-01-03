'use client';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import { usePathname } from 'next/navigation';

function getTitle(pathName: string): string {
  switch (pathName) {
    case '/':
      return 'Dashboard';
    case '/orders':
      return 'Orders';
    case '/products':
      return 'Products';
    case '/home-sections':
      return 'Home Sections';
    case '/categories':
      return 'Categories';
    case '/users':
      return 'Users';
    case '/payments':
      return 'Payments';
    case '/carts':
      return 'Carts';
    case '/reviews':
      return 'Reviews';
    case '/coupons':
      return 'Coupons';
    case '/referrals':
      return 'Referrals';
    case '/banners':
      return 'Banners';
    case '/wishlists':
      return 'Wishlists';
    case '/settings':
      return 'Settings';
    case '/dynamic-home-sections':
      return 'Dynamic Home Sections';
    case '/dynamic-subcollections':
      return 'Dynamic Subcollections';
    default:
      // Try to extract title from pathname if it starts with a known route
      if (pathName.startsWith('/orders')) return 'Orders';
      if (pathName.startsWith('/products')) return 'Products';
      if (pathName.startsWith('/categories')) return 'Categories';
      if (pathName.startsWith('/users')) return 'Users';
      if (pathName.startsWith('/payments')) return 'Payments';
      if (pathName.startsWith('/carts')) return 'Carts';
      if (pathName.startsWith('/reviews')) return 'Reviews';
      if (pathName.startsWith('/coupons')) return 'Coupons';
      if (pathName.startsWith('/referrals')) return 'Referrals';
      if (pathName.startsWith('/banners')) return 'Banners';
      if (pathName.startsWith('/wishlists')) return 'Wishlists';
      if (pathName.startsWith('/settings')) return 'Settings';
      if (pathName.startsWith('/home-sections')) return 'Home Sections';
      if (pathName.startsWith('/dynamic-home-sections')) return 'Dynamic Home Sections';
      if (pathName.startsWith('/dynamic-subcollections')) return 'Dynamic Subcollections';
      return 'Dashboard';
  }
}

export function AppHeader() {
  const pathName = usePathname();
  const title = getTitle(pathName);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center justify-center">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <span className="ps-1.5 text-base font-semibold text-foreground">{title}</span>
        </div>
        <div className={`flex items-center gap-2`}>
          {/* {<SearchCommand />} */}
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
