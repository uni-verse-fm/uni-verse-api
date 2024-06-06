/* Copyright (c) 2022 uni-verse corp */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type TrackDocument = Track & Document;

@Schema({ timestamps: true })
export class Track {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({
    set: (content: string) => {
      return content.trim();
    },
  })
  title: string;

  @Prop()
  fileName: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  author: User;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  @Type(() => User)
  feats: User[];

  @Prop()
  isPlagia: boolean;

  @Prop()
  isFeatsWaiting: boolean;
}

const TrackSchema = SchemaFactory.createForClass(Track);

TrackSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

TrackSchema.index({ title: 'text' });

export { TrackSchema };
