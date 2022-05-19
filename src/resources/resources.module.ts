import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesService } from '../files/files.service';
import { MinioClientService } from '../minio-client/minio-client.service';
import { PaymentsService } from '../payments/payments.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import UsersModule from '../users/users.module';
import { ResourcesService } from './resources.service';
import { Resource, ResourceSchema } from './schemas/resource.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resource.name, schema: ResourceSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
  ],
  controllers: [],
  providers: [
    ResourcesService,
    FilesService,
    MinioClientService,
    PaymentsService,
  ],
  exports: [ResourcesService],
})
export class ResourcesModule {}
