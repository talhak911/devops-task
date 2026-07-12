import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getHealthStatus() {
    return {
      status: 'ok',
      service: 'Real-Time Notification Service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
