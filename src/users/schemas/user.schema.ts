import * as bcrypt from 'bcrypt';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Document } from 'mongoose';
import { Release } from '../../releases/schemas/release.schema';
import { Transform, Type } from 'class-transformer';

export type UserDocument = User & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
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

  @Type(() => Release)
  releases: Release[];

  @Prop()
  public stripeCustomerId: string;
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
