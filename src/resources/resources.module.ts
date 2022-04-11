import { Module } from '@nestjs/common';
import { FilesService } from '../files/files.service';
import { UsersService } from '../users/users.service';
import { ResourcesService } from './resources.service';

@Module({
  providers: [ResourcesService, FilesService, UsersService],
})
export class ResourcesModule {}
