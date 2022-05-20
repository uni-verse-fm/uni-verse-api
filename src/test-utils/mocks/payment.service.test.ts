import { PaymentsService } from '../../payments/payments.service';

export const PaymentServiceMock = {
  provide: PaymentsService,
  useValue: {
    createCustomer: jest.fn(() => {
      return { id: 1 };
    }),
  },
};
