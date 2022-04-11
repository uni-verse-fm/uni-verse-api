import { Module } from '@nestjs/common';
import { ResourcePacksService } from './resource-packs.service';
import { ResourcePacksController } from './resource-packs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ResourcePack,
  ResourcePackSchema,
} from './schemas/resource-pack.schema';
import { Resource, ResourceSchema } from '../resources/schemas/resource.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ResourcesService } from '../resources/resources.service';
import { UsersService } from '../users/users.service';
import { FilesService } from '../files/files.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResourcePack.name, schema: ResourcePackSchema },
      { name: Resource.name, schema: ResourceSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ResourcePacksController],
  providers: [
    ResourcePacksService,
    ResourcesService,
    UsersService,
    FilesService,
  ],
})
export class ResourcePacksModule {}
