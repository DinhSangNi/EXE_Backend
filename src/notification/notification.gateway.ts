import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() userId: string) {
    client.join(userId);
    this.server.to(userId).emit('joined', 'joined');
    console.log(`User with ID ${userId} joined room ${userId}`);
  }

  sendNotification(userId: string, payload: any) {
    this.server.to(userId).emit('notification', payload);
  }
}
