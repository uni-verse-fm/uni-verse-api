import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

export const RmqServiceMock = {
  provide: AmqpConnection,
  useValue: {
    publish: jest.fn(() => {
      return null;
    }),
  },
};
