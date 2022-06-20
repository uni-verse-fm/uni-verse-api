import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type ResourceDocument = Resource & Document;

@Schema({ timestamps: true })
export class Resource {
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

  @Prop()
  previewFileName: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  author: User;
}

const ResourceSchema = SchemaFactory.createForClass(Resource);

ResourceSchema.index({ title: 'text' });

export { ResourceSchema };
