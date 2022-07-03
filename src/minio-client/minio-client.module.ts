import { Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';

@Module({
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
