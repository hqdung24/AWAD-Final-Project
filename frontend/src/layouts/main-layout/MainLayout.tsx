import { Outlet } from 'react-router-dom';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/auth';

export default function MainLayout() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isGuest = !accessToken;

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader showSidebarToggle={!isGuest} />
        <div className="flex flex-1">
          {!isGuest && <AppSidebar />}
          <SidebarInset className={isGuest ? 'w-full' : undefined}>
            <Outlet />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
