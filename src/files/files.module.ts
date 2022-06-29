import { Module } from '@nestjs/common';
import { MinioClientModule } from '../minio-client/minio-client.module';
import { FilesService } from './files.service';

@Module({
  imports: [MinioClientModule],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
