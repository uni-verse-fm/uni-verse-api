/* Copyright (c) 2022 uni-verse corp */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongoose';
import mongoose from 'mongoose';
import { Track } from 'src/tracks/schemas/track.schema';
import { User } from 'src/users/schemas/user.schema';

export type FpSearchDocument = FpSearch & Document;

@Schema({ timestamps: true })
export class FpSearch {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  @Type(() => User)
  author?: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: false })
  @Type(() => Track)
  foundTrack?: Track;

  @Prop({ required: false })
  takenTime?: number;

  @Prop({ required: true })
  filename: string;
}

const FpSearchSchema = SchemaFactory.createForClass(FpSearch);

FpSearchSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export { FpSearchSchema };
