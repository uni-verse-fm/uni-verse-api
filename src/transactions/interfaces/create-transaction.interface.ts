/* Copyright (c) 2022 uni-verse corp */

export enum TransactionType {
  Donation = 'Donation',
  Purchase = 'Purchase',
}

export class CreateTransaction {
  user: string;
  product: string;
  amount?: number;
  type: TransactionType;
  destUser: string;
}
