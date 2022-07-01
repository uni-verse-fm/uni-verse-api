import { FilesModule } from './../files/files.module';
import { PaymentsModule } from './../payments/payments.module';
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
import { ResourcesModule } from '../resources/resources.module';
import PacksSearchService from './packs-search.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResourcePack.name, schema: ResourcePackSchema },
      { name: Resource.name, schema: ResourceSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ResourcesModule,
    SearchModule,
    PaymentsModule,
    FilesModule,
  ],
  controllers: [ResourcePacksController],
  providers: [ResourcePacksService, PacksSearchService],
  exports: [ResourcePacksService, PacksSearchService],
})
export class ResourcePacksModule {}
