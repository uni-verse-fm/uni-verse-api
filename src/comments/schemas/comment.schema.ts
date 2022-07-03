/* Copyright (c) 2022 uni-verse corp */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  isPositive: boolean;

  @Prop()
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  owner: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, refPath: 'modelType' })
  modelId: ObjectId;

  @Prop({ type: String, enum: ['Track', 'Resource'] })
  modelType: string;
}

const CommentSchema = SchemaFactory.createForClass(Comment);

export { CommentSchema };
