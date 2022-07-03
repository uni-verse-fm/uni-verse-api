/* Copyright (c) 2022 uni-verse corp */

export interface IDonate {
  amount: number;
  customerId: string;
  paymentMethodId?: string;
  saveCard?: boolean;
}
