/* Copyright (c) 2022 uni-verse corp */

import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

export const AmqpConnectionMock = {
  provide: AmqpConnection,
  useValue: {
    publish: jest.fn(() => undefined),
  },
};
