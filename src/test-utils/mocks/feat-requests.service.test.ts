/* Copyright (c) 2022 uni-verse corp */

import { FeatRequestsService } from '../../feat-requests/feat-requests.service';

export const FeatRequestsServiceMock = {
  provide: FeatRequestsService,
  useValue: {
    createFeatRequest: jest.fn(() => {
      return {};
    }),
  },
};
