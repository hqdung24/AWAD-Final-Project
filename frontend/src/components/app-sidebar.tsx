import * as React from 'react';
import {
  BusFront,
  ChartNoAxesCombined,
  Command,
  LifeBuoy,
  Map,
  PieChart,
  Route as RouteIcon,
  Send,
  Settings2,
  Users,
} from 'lucide-react';
import { useLocation } from 'react-router';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { me } = useUserStore();
  const role = useAuthStore((s) => s.role);

  const adminNav = [
    { title: 'Overview', url: '/upcoming-trip', icon: PieChart },
    { title: 'Routes', url: '/routes', icon: RouteIcon },
    { title: 'Trips', url: '/trips', icon: BusFront },
    { title: 'Buses', url: '/buses', icon: BusFront },
    { title: 'Operators', url: '/operators', icon: Users },
    { title: 'Admin Accounts', url: '/admin-users', icon: Users },
    { title: 'Profile', url: '/account', icon: Users },
    { title: 'Analytics', url: '/analytics', icon: ChartNoAxesCombined },
    { title: 'Reports', url: '/reports', icon: Map },
    { title: 'Settings', url: '#settings', icon: Settings2 },
  ];

  const userNav = [
    { title: 'Your trips', url: '/upcoming-trip', icon: BusFront },
    { title: 'Profile', url: '/account', icon: Users },
    { title: 'Payments', url: '#payments', icon: ChartNoAxesCombined },
    { title: 'Notifications', url: '#notifications', icon: Send },
  ];

  const navItems = (role === 'ADMIN' ? adminNav : userNav).map((item) => ({
    ...item,
    isActive:
      location.pathname === '/'
        ? item.url === '/'
        : location.pathname.startsWith(item.url),
  }));

  const displayName = `${me?.firstName ?? 'User'} ${me?.lastName ?? ''}`.trim();

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {role === 'ADMIN' ? 'Admin Panel' : 'User Dashboard'}
                  </span>
                  <span className="truncate text-xs">
                    {role === 'ADMIN' ? 'Control Center' : 'Your trips'}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavSecondary
          items={[
            { title: 'Support', url: '#support', icon: LifeBuoy },
            { title: 'Feedback', url: '#feedback', icon: Send },
          ]}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: displayName || 'Guest',
            email: me?.email ?? 'guest@example.com',
            avatar: '/avatars/shadcn.jpg',
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
