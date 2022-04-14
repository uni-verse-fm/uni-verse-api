import { Module } from '@nestjs/common';
import { MinioClientService } from '../minio-client/minio-client.service';
import { FilesService } from './files.service';

@Module({
  imports: [],
  controllers: [],
  providers: [FilesService, MinioClientService],
  exports: [FilesService],
})
export class FilesModule {}
