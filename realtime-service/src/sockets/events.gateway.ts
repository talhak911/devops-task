import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      // In development or if CORS_ORIGINS is not set, allow all
      const corsOrigins = process.env.CORS_ORIGINS;
      if (!corsOrigins || corsOrigins === '*') {
        return callback(null, true);
      }
      
      const allowedOrigins = corsOrigins.split(',');
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly configService: ConfigService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (token) {
        const secret = this.configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not configured');
        }
        const decoded: any = jwt.verify(token, secret);
        const userId = decoded.id;

        // Join user to their personal room
        client.join(`user:${userId}`);
        console.log(`[EventsGateway] Client ${client.id} authenticated as user ${userId}`);
      } else {
        console.log(`[EventsGateway] Client ${client.id} connected as Guest`);
      }
    } catch (err) {
      console.log(`[EventsGateway] Client ${client.id} connection error: ${err.message}`);
      // Don't necessarily disconnect, just treat as guest or log error
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[EventsGateway] Client disconnected: ${client.id}`);
  }

  // Method to send direct messages to a user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Method to broadcast to everyone
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }

  @SubscribeMessage('joinProductRoom')
  handleJoinProductRoom(client: Socket, productId: string) {
    client.join(`product:${productId}`);
  }

  @SubscribeMessage('leaveProductRoom')
  handleLeaveProductRoom(client: Socket, productId: string) {
    client.leave(`product:${productId}`);
  }

  broadcastToProduct(productId: string, event: string, data: any) {
    this.server.to(`product:${productId}`).emit(event, data);
  }
}
