import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Resource } from '../../resources/schemas/resource.schema';
import { User } from '../../users/schemas/user.schema';

export type ResourcePackDocument = ResourcePack & Document;

@Schema()
export class ResourcePack {
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
  coverName: string;

  @Prop()
  previewUrl: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  author: User;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }])
  @Type(() => Resource)
  resources: Resource[];
}

const ResourcePackSchema = SchemaFactory.createForClass(ResourcePack);

ResourcePackSchema.index({ title: 'text', description: 'text' });

export { ResourcePackSchema };
