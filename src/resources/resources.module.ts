import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesModule } from '../files/files.module';
import { FilesService } from '../files/files.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
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
    providers: [ResourcesService, FilesService, UsersService],
})
export class ResourcesModule { }
