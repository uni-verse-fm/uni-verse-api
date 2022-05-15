export interface IPurchase {
    customerId: string;
    amount: number;
    targetCustomerId: string;
    productId: string;
    paymentMethodId?: string;
    saveCard?: boolean;
}