/* Copyright (c) 2022 uni-verse corp */

import * as bcrypt from 'bcrypt';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Document } from 'mongoose';
import { Transform } from 'class-transformer';
import { Provider } from '../../auth/auth.service';

export type UserDocument = User & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
  timestamps: true,
})
export class User {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ unique: true })
  username: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ select: false })
  password: string;

  @Prop()
  stripeAccountId: string = null;

  @Prop()
  profilePicture: string = null;

  @Prop()
  donationProductId: string = null;

  @Prop()
  provider: Provider = 'local';

  @Prop({ select: false })
  currentHashedRefreshToken: string;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('releases', {
  ref: 'Release',
  localField: '_id',
  foreignField: 'author',
});

UserSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    const hashed = await bcrypt.hash(this['password'], 10);
    this['password'] = hashed;

    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.index({ username: 'text', email: 'text' });

export { UserSchema };
