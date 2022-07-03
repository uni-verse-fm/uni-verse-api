/* Copyright (c) 2022 uni-verse corp */

import { FilesModule } from './../files/files.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ResourcesService } from './resources.service';
import { Resource, ResourceSchema } from './schemas/resource.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resource.name, schema: ResourceSchema },
      { name: User.name, schema: UserSchema },
    ]),
    FilesModule,
  ],
  controllers: [],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
