import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Track } from '../../tracks/schemas/track.schema';

export type ViewDocument = View & Document;

@Schema({ timestamps: true })
export class View {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Track' })
  @Type(() => Track)
  track: Track;
}

const ViewSchema = SchemaFactory.createForClass(View);

export { ViewSchema };
