/* Copyright (c) 2022 uni-verse corp */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Track } from '../../tracks/schemas/track.schema';
import { User } from '../../users/schemas/user.schema';

export type FeatRequestDocument = FeatRequest & Document;

@Schema({ timestamps: true })
export class FeatRequest {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  dest: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Track' })
  @Type(() => Track)
  track: Track;
}

const FeatRequestSchema = SchemaFactory.createForClass(FeatRequest);

export { FeatRequestSchema };
