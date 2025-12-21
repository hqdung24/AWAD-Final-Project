export interface ISocketEvent {
  event: string;
  data: any;
  timestamp: Date;
}

export interface ISocketUser {
  userId: string;
  socketId: string;
  connectedAt: Date;
}

export interface IRealtimeMessage {
  type: string;
  payload: any;
  timestamp: Date;
}
