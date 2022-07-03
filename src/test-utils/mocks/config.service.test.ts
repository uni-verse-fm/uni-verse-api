/* Copyright (c) 2022 uni-verse corp */

import { ConfigService } from '@nestjs/config';

export const ConfigServiceMock = {
  provide: ConfigService,
  useValue: {
    get: jest.fn().mockReturnValue('60s'),
  },
};
