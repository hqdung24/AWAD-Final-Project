import { Home, SidebarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { SearchForm } from '@/components/search-form';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/auth';
import { NotificationModal } from './layout/NotificationModal';
type Props = {
  showSidebarToggle?: boolean;
};

export function SiteHeader({ showSidebarToggle = true }: Props) {
  const { toggleSidebar } = useSidebar();

  const accessToken = useAuthStore((s) => s.accessToken);
  const isGuest = !accessToken;

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <Home className="h-5 w-5" />
            <span className="sr-only">Back to home</span>
          </Link>
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        {showSidebarToggle && (
          <>
            <Button
              className="h-8 w-8"
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
            >
              <SidebarIcon />
            </Button>
            <Separator orientation="vertical" className="mr-2 h-4" />
          </>
        )}
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
        <ThemeToggle className="hidden sm:inline-flex" />
        <NotificationModal />
        {isGuest && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/signin">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
