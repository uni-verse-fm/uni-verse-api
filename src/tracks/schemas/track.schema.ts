import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Release } from '../../releases/schemas/release.schema';
import { User } from '../../users/schemas/user.schema';

export type TrackDocument = Track & Document;

@Schema()
export class Track {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  title: string;

  @Prop()
  trackFileUrl: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Release' })
  @Type(() => Release)
  release: Release;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  author: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  feats: User[];
}

const TrackSchema = SchemaFactory.createForClass(Track);

TrackSchema.index({ title: 'text' });

export { TrackSchema };
