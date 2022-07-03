import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { TransactionType } from '../interfaces/create-transaction.interface';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  user: User;

  @Prop({
    type: String,
    enum: [TransactionType.Donation, TransactionType.Purchase],
  })
  type: TransactionType;

  @Prop()
  product: string;

  @Prop()
  amount: number;

  @Prop()
  enabled: boolean;

  @Prop()
  destUser: string;
}

const TransactionSchema = SchemaFactory.createForClass(Transaction);

export { TransactionSchema };
