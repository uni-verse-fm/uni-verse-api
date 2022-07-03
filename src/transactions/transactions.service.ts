import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import {
  CreateTransaction,
  TransactionType,
} from './interfaces/create-transaction.interface';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async createTransaction(createTransaction: CreateTransaction) {
    this.logger.log(
      `Creating ${createTransaction.type} of ${createTransaction.product}`,
    );

    const transcation = new this.transactionModel({
      ...createTransaction,
      enabled: false,
    });

    try {
      const savedTransaction = await transcation.save();
      return savedTransaction._id;
    } catch (err) {
      this.logger.error(`Can not create transaction due to: ${err}`);
      throw new BadRequestException(err.message);
    }
  }

  async activateTransaction(id: string) {
    this.logger.log(`Enabling transaction ${id}`);

    return await this.transactionModel
      .updateOne({ _id: id }, { enabled: true })
      .catch(() => {
        this.logger.error(`Can not enable transaction ${id}`);
        throw new NotFoundException(`Can not enable transaction ${id}`);
      });
  }

  async findUserTransaction(
    userId: string,
    type: TransactionType,
    destUserId?: string,
    productId?: string,
  ) {
    this.logger.log(`Finding user ${userId} transaction of ${productId}`);

    const shared = {
      user: userId,
      type,
      enabled: true,
    };

    const query = destUserId
      ? { ...shared, destUser: destUserId }
      : { ...shared, product: productId };
    return await this.transactionModel.find(query).catch(() => {
      this.logger.error(
        `Can not find trasactions of product with ID "${productId}"`,
      );
      throw new NotFoundException(
        `Can not find trasactions of product with ID "${productId}"`,
      );
    });
  }

  async findUserTransactions(userId: string) {
    this.logger.log(`Finding user ${userId} transactions`);

    return await this.transactionModel
      .find({ user: userId, enabled: true })
      .catch(() => {
        this.logger.error(
          `Can not find trasactions of user with ID "${userId}"`,
        );
        throw new NotFoundException(
          `Can not find trasactions of user with ID "${userId}"`,
        );
      });
  }

  async isUserTheOwner(userId: string, productId: string) {
    this.logger.log(`Finding user ${userId} transactions`);
    return this.findUserTransaction(
      userId,
      TransactionType.Purchase,
      undefined,
      productId,
    )
      .then((response) => (response.length > 0 ? true : false))
      .catch((error) => {
        throw new NotFoundException(error.message);
      });
  }

  async countSumOfDonations(userId: string, destUserId: string) {
    this.logger.log(`Finding sum of ${userId} donations`);

    return await this.transactionModel
      .aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
            destUser: new mongoose.Types.ObjectId(destUserId),
            type: TransactionType.Donation,
            enabled: true,
          },
        },
        { $group: { _id: null, sum_val: { $sum: '$amount' } } },
      ])
      .then((response: [{ _id: any; sum_val: number }]) => response[0].sum_val)
      .catch(() => {
        this.logger.error(`Can not find donations of user with ID "${userId}"`);
        throw new NotFoundException(
          `Can not find donations of user with ID "${userId}"`,
        );
      });
  }

  async removeTransaction(id: string) {
    this.logger.log(`Removing transaction ${id}`);
    if (id) {
      const transaction = await this.transactionModel.findById(id);
      await transaction.remove().catch(() => {
        throw new BadRequestException(`Can't remove transaction ${id}`);
      });
      return transaction._id;
    }
  }
}
