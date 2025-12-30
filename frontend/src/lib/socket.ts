import { io, Socket } from 'socket.io-client';
import { getGuestId } from './utils';

let socket: Socket | null = null;
let currentUserId: string | null = null;

export function getSocket(userId?: string): Socket {
  const nextUserId = userId ?? `guest:${getGuestId()}`;

  // 🔁 Identity changed → force reconnect
  if (socket && currentUserId !== nextUserId) {
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }

  if (!socket) {
    socket = io('http://localhost:3000/realtime', {
      auth: {
        userId: userId ?? undefined,
        guestId: userId ? undefined : nextUserId.replace('guest:', ''),
      },
      transports: ['websocket'],
      autoConnect: true,
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
