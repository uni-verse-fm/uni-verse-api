/* Copyright (c) 2022 uni-verse corp */

import { PaymentsService } from '../../payments/payments.service';

export const PaymentServiceMock = {
  provide: PaymentsService,
  useValue: {
    createCustomer: jest.fn(() => {
      return { id: 1 };
    }),

    findAccount: jest.fn(() => {
      return {
        charges_enabled: true,
        details_submitted: true,
      };
    }),

    createPrice: jest.fn(() => {
      return {
        id: 'prce_123',
        product: 'prdt_123',
      };
    }),
  },
};
