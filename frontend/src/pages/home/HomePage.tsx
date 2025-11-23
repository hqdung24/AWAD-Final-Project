import { useUserStore } from '@/stores/user';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

export default function HomePage() {
  const role = useUserStore((s) => s.me?.role ?? 'USER');

  if (role === 'ADMIN') {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}
