export interface IDonate {
  amount: number;
  customerId: string;
  paymentMethodId?: string;
  saveCard?: boolean;
}
