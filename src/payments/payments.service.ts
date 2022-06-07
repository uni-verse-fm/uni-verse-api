import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';
import { User } from '../users/schemas/user.schema';
import { DonationAmount } from './dto/create-donate.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private univerDonationProductId: string;
  private readonly logger: Logger = new Logger(PaymentsService.name);

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2020-08-27',
    });
    this.univerDonationProductId = configService.get(
      'UNIVERSE_DONATION_PRODUCT_ID',
    );
  }

  public async onboard(user: User) {
    this.logger.log(`Onboarding user ${user._id}`);
    try {
      const accountLink = await this.stripe.accountLinks.create({
        type: 'account_onboarding',
        account: user.stripeAccountId,
        refresh_url: `${this.configService.get('REFRESH_URL')}`,
        return_url: `${this.configService.get('FRONTEND_URL')}`,
      });
      return accountLink.url;
    } catch (err) {
      throw new Error(`Can't onboard user on stripe due to: ${err}`);
    }
  }

  public async refreshOnboardLink(request: IRequestWithUser) {
    this.logger.log(`Refreshing onboarding user`);
    const accountId = request.user?.stripeAccountId;
    if (!accountId) throw new BadRequestException('Account id is undefined');
    try {
      const origin = `${request.secure ? 'https://' : 'http://'}${
        request.headers.host
      }`;
      const accountLink = await this.stripe.accountLinks.create({
        type: 'account_onboarding',
        account: accountId,
        refresh_url: `${origin}/payments/refresh`,
        return_url: `${this.configService.get('FRONTEND_URL')}`,
      });

      return accountLink.url;
    } catch (err) {
      throw new InternalServerErrorException("Can't onboard user on stripe");
    }
  }

  public async checkout(priceId: string, connectedAccountId?: string) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${this.configService.get('FRONTEND_URL')}/Success`,
        cancel_url: `${this.configService.get('FRONTEND_URL')}`,
        payment_intent_data: connectedAccountId
          ? {
              application_fee_amount: 30,
              transfer_data: {
                destination: connectedAccountId,
              },
            }
          : undefined,
      });

      return session.url;
    } catch (err) {
      throw new Error(`Can't onboard user on stripe due to: ${err}`);
    }
  }

  public async createAccount() {
    this.logger.log(`Creating stripe account`);
    return await this.stripe.accounts
      .create({
        type: 'standard',
      })
      .then((response) => response.id)
      .catch(() => {
        this.logger.error("Can't create stripe account");
        throw new InternalServerErrorException("Can't create stripe account");
      });
  }

  public async deleteAccount(accountId: string) {
    this.logger.log(`Delete account ${accountId}`);
    return await this.stripe.accounts.del(accountId).catch(() => {
      this.logger.error(`Can not Delete stripe account ${accountId}`);
      throw new Error(`Can not Delete stripe account ${accountId}`);
    });
  }

  public async createPrice(
    name: string,
    ownerId: string,
    amount: number,
    productId?: string,
  ) {
    this.logger.log(`Creating prices for owner: ${ownerId}`);
    const productData = productId
      ? { product: productId }
      : {
          product_data: {
            name,
            metadata: {
              ownerId,
            },
          },
        };
    return await this.stripe.prices
      .create({
        unit_amount: amount,
        currency: this.configService.get('STRIPE_CURRENCY'),
        ...productData,
        metadata: {
          ownerId,
        },
      })
      .catch(async () => {
        productId && (await this.disableProduct(productId));
        throw new Error("Couldn't create the price for the product");
      });
  }

  public async createDonations(ownerId: string) {
    this.logger.log(`Creating donations for owner: ${ownerId}`);
    const donationAmounts = [100, 200, 300, 500];
    return await this.stripe.products
      .create({
        name: `donation`,
      })
      .then(async (response) => {
        await Promise.all(
          donationAmounts.map((amount: number) =>
            this.createPrice(
              `${ownerId}-donation`,
              ownerId,
              amount,
              response.id,
            ),
          ),
        );

        return response.id;
      })
      .catch(() => {
        this.logger.error("Couldn't create the product");
        throw new Error("Couldn't create the product");
      });
  }

  public async disableProduct(productId: string) {
    return await this.stripe.products
      .update(productId, { active: false })
      .catch(() => {
        this.logger.error("Couldn't update the product");
        throw new Error("Couldn't update the product");
      });
  }

  public async findAccount(accountId: string) {
    this.logger.log(`Find account ${accountId}`);
    const response = await this.stripe.accounts.retrieve(accountId);
    if (!response) {
      this.logger.error(`Can not find account ${accountId}`);
      throw new Error(`Can not find account ${accountId}`);
    }
    return response;
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

  public async findProductPrices(productId: string) {
    this.logger.log(`Find product ${productId}`);
    const response = await this.stripe.prices
      .search({ query: `product: \'${productId}\'` })
      .catch((error) => {
        throw new Error(`Can not find product ${productId}` + error);
      });
    if (!response) {
      this.logger.error(`Can not find product ${productId} prices`);
      throw new Error(`Can not find product ${productId} prices`);
    }
    return response.data.map((price) => ({
      id: price.id,
      amount: price.unit_amount_decimal,
    }));
  }

  public async deleteCustomer(customerId: string) {
    this.logger.log(`Deleting customer ${customerId}`);
    const response = await this.stripe.customers.del(customerId);
    if (!response) throw new Error('Somthing wrong with payment server');
    return response;
  }

  public async donate(
    donationAmout: DonationAmount,
    productId: string = this.univerDonationProductId,
    connectedAccountId?: string,
  ) {
    this.logger.log(`Making donation`);
    await this.stripe.products.retrieve(productId).catch(() => {
      throw new Error(`Product ${productId} doesn't exist`);
    });
    const productPrice = await this.findProductPrices(productId);

    const prices = productPrice.filter(
      (price) => price.amount === donationAmout.toString(),
    );
    if (prices.length === 0) {
      throw new Error(`Can not donate did you finish your onboarding ?`);
    }
    return await this.checkout(prices[0].id, connectedAccountId);
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
