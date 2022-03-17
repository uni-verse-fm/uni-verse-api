import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Track } from '../../tracks/schemas/track.schema';
import { User } from '../../users/schemas/user.schema';

export type ReleaseDocument = Release & Document;

@Schema()
export class Release {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  title: string;

  @Prop({
    set: (content: string) => {
      return content.trim();
    },
  })
  description: string;

  @Prop()
  coverUrl: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  author: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  feats: User[];

  @Type(() => Track)
  tracks: Track[];
}

const ReleaseSchema = SchemaFactory.createForClass(Release);

ReleaseSchema.index({ title: 'text', description: 'text' });

export { ReleaseSchema };
