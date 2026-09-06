import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import type { Server } from 'socket.io';
import { JOB_EVENT, type JobEvent } from '../common/events/job-event';

@WebSocketGateway({ cors: { origin: '*' } })
export class JobEventsGateway {
  @WebSocketServer()
  private readonly server: Server;

  @OnEvent(JOB_EVENT)
  handleJobEvent(payload: JobEvent): void {
    this.server.emit(JOB_EVENT, payload);
  }
}
