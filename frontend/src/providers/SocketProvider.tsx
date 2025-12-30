import { useEffect } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { useUserStore } from '@/stores/user';

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = useUserStore((s) => s.me?.id);

  useEffect(() => {
    // Initialize or reinitialize socket when user identity changes
    const socket = getSocket(userId ?? undefined);

    const onConnectError = (err: Error) => {
      // Optional: log or surface a toast
      console.warn('Socket connect error:', err.message);
    };

    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect_error', onConnectError);
      // Do not disconnect on route changes; only on unmount of provider (app closing)
      // disconnectSocket();
    };
  }, [userId]);

  // Cleanup socket when the app is fully unmounted
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  return children as React.ReactElement;
}
