import { io, Socket } from 'socket.io-client';
import { getGuestId } from './utils';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;
let currentUserId: string | null = null;

export function getSocket(userId?: string): Socket {
  const nextUserId = userId ?? `guest:${getGuestId()}`;

  if (socket && currentUserId !== nextUserId) {
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }

  if (!socket) {
    socket = io(`${SOCKET_URL}/realtime`, {
      auth: {
        userId: userId ?? undefined,
        guestId: userId ? undefined : nextUserId.replace('guest:', ''),
      },
      transports: ['websocket'],
      autoConnect: true,
      withCredentials: true,
    });

    currentUserId = nextUserId;
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }
}
