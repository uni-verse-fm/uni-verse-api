import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Resource } from '../../resources/schemas/resource.schema';
import { User } from '../../users/schemas/user.schema';

export type ResourcePackDocument = ResourcePack & Document;

@Schema({ timestamps: true })
export class ResourcePack {
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

  @Prop({ type: String, enum: ['free', 'paid', 'donation'] })
  accessType: string;

  @Prop()
  amount?: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Type(() => User)
  author: User;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }])
  @Type(() => Resource)
  resources: Resource[];

  @Prop()
  priceId: string;
}

const ResourcePackSchema = SchemaFactory.createForClass(ResourcePack);

ResourcePackSchema.index({ title: 'text' });

export { ResourcePackSchema };
