/* Copyright (c) 2022 uni-verse corp */

export interface IPurchase {
  customerId: string;
  amount: number;
  targetCustomerId: string;
  productId: string;
  paymentMethodId?: string;
  saveCard?: boolean;
}
