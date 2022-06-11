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
import { ResourcesModule } from '../resources/resources.module';
import { FilesService } from '../files/files.service';
import { MinioClientService } from '../minio-client/minio-client.service';
import { PaymentsService } from '../payments/payments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResourcePack.name, schema: ResourcePackSchema },
      { name: Resource.name, schema: ResourceSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ResourcesModule,
  ],
  controllers: [ResourcePacksController],
  providers: [
    ResourcePacksService,
    ResourcesService,
    FilesService,
    MinioClientService,
    PaymentsService,
  ],
  exports: [ResourcePacksService],
})
export class ResourcePacksModule {}
