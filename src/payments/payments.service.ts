import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { IDonate } from './interfaces/donate.interface';
import { IPurchase } from './interfaces/purchase.interface';

enum PaymentType {
  Donation = 'donation',
  Purchase = 'purchase',
}

interface IDonationMetadata {
  paymentType: PaymentType;
}

interface IPurchaseMetadata {
  paymentType: PaymentType;
  targetCustomerId: string;
  productId: string;
}

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger: Logger = new Logger(PaymentsService.name);

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2020-08-27',
    });
  }

  public async findCustomer(customerId: string) {
    this.logger.log(`Find customer ${customerId}`);
    const response = await this.stripe.customers.retrieve(customerId);
    if (!response) {
      this.logger.error(`Can not find customer ${customerId}`);
      throw new Error('Somthing wrong with payment server');
    }
    return response;
  }

  public async createCustomer(name: string, email: string) {
    this.logger.log(`Creating customer ${name} ${email}`);
    const response = await this.stripe.customers.create({
      name,
      email,
    });
    if (!response) {
      this.logger.error(`Can not create customer ${name} ${email}`);
      throw new Error('Somthing wrong with the payment server');
    }
    return response;
  }

  public async deleteCustomer(customerId: string) {
    this.logger.log(`Deleting customer ${customerId}`);
    const response = await this.stripe.customers.del(customerId);
    if (!response) throw new Error('Somthing wrong with payment server');
    return response;
  }

  public async payWithNewSource(
    paymentPayload: IPurchase | IDonate,
    metadata: IDonationMetadata | IPurchaseMetadata,
  ) {
    this.logger.log(`Creating payment with new source`);
    const currency = this.configService.get('STRIPE_CURRENCY');

    const data = {
      customer: paymentPayload.customerId,
      amount: paymentPayload.amount,
      currency,
      metadata: { ...metadata },
    };

    let response;
    if (paymentPayload.saveCard) {
      response = await this.stripe.paymentIntents.create({
        ...data,
        setup_future_usage: 'off_session',
        automatic_payment_methods: {
          enabled: true,
        },
      });
    } else {
      response = await this.stripe.paymentIntents.create({
        ...data,
        payment_method: paymentPayload.paymentMethodId,
        confirm: true,
      });
    }

    if (!response) {
      this.logger.error(`Can not create payment with new source`);
      throw new Error("Can't charge you");
    }
    return response;
  }

  public async payWithExistingSource(
    amount: number,
    customerId: string,
    metadata: IDonationMetadata | IPurchaseMetadata,
  ) {
    this.logger.log(`Creating payment with existing source`);
    const currency = this.configService.get('STRIPE_CURRENCY');
    const response = await this.stripe.charges.create({
      amount,
      currency,
      customer: customerId,
      metadata: { ...metadata },
    });
    if (!response) {
      this.logger.error(`Can not create payment with existing source`);
      throw new Error("Can't charge you");
    }
    return response;
  }

  public async donate(donatePayload: IDonate) {
    this.logger.log(`Creating donation`);
    const metadata: IDonationMetadata = { paymentType: PaymentType.Donation };
    if (donatePayload.paymentMethodId)
      return await this.payWithNewSource(donatePayload, metadata);
    return await this.payWithExistingSource(
      donatePayload.amount,
      donatePayload.customerId,
      metadata,
    );
  }

  public async buyResourcePack(purchasePayload: IPurchase) {
    this.logger.log(`Creating purchase`);
    const metadata: IPurchaseMetadata = {
      paymentType: PaymentType.Purchase,
      targetCustomerId: purchasePayload.targetCustomerId,
      productId: purchasePayload.productId,
    };
    if (purchasePayload.paymentMethodId)
      return await this.payWithNewSource(purchasePayload, metadata);
    return await this.payWithExistingSource(
      purchasePayload.amount,
      purchasePayload.customerId,
      metadata,
    );
  }

  public async findAllPayments(customerId: string) {
    this.logger.log(`Find all payments for customer ${customerId}`);
    return 'This action adds a new payement';
  }

  public async findOnePayementById(customerId, payementId) {
    this.logger.log(
      `Find one payment ${payementId} for customer ${customerId}`,
    );
    return `This action returns all payments`;
  }
}
