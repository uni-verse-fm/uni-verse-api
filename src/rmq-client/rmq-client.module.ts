import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'uni-verse-fp-in',
          type: 'direct',
        },
        {
          name: 'uni-verse-fp-search',
          type: 'direct',
        },
      ],
      uri: `amqp://${process.env.RMQ_USER}:${process.env.RMQ_PASSWORD}@${process.env.RMQ_URL}:${process.env.RMQ_PORT}`,
      connectionInitOptions: { wait: false },
    }),
  ],
  exports: [RabbitMQModule],
})
export class RMQModule {}
