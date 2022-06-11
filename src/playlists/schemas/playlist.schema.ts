import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Track } from '../../tracks/schemas/track.schema';
import { User } from '../../users/schemas/user.schema';

export type PlaylistDocument = Playlist & Document;

@Schema({ timestamps: true })
export class Playlist {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  title: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  owner: User;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }])
  @Type(() => Track)
  tracks: Track[];
}

const PlaylistSchema = SchemaFactory.createForClass(Playlist);

PlaylistSchema.index({ title: 'text' });

export { PlaylistSchema };
