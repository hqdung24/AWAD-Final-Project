import { io, Socket } from 'socket.io-client';
import { getGuestId } from './utils';

let socket: Socket | null = null;
let currentToken: string | null = null;

export function getSocket(token?: string): Socket {
  const nextToken = token ?? null;

  // 🔁 Token changed → force reconnect
  if (socket && currentToken !== nextToken) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }

  if (!socket) {
    socket = io('http://localhost:3000/realtime', {
      auth: {
        token: nextToken ?? undefined,
        guestId: nextToken ? undefined : getGuestId(),
      },
      transports: ['websocket'],
      autoConnect: true,
    });

    currentToken = nextToken;
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}
