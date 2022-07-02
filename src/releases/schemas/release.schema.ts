import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Track } from '../../tracks/schemas/track.schema';
import { User } from '../../users/schemas/user.schema';

export type ReleaseDocument = Release & Document;

@Schema({ timestamps: true })
export class Release {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({
    set: (content: string) => {
      return content.trim();
    },
  })
  title: string;

  @Prop({
    set: (content: string) => {
      return content.trim();
    },
  })
  description: string;

  @Prop()
  coverName: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  author: User;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  @Type(() => User)
  feats: User[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }])
  @Type(() => Track)
  tracks: Track[];
}

const ReleaseSchema = SchemaFactory.createForClass(Release);

ReleaseSchema.index({ title: 'text' });

export { ReleaseSchema };
