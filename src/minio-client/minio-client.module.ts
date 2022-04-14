import { Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';

@Module({
  imports: [
    // MinioModule.register({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     endPoint: configService.get('MINIO_ENDPOINT'),
    //     port: configService.get('MINIO_PORT'),
    //     useSSL: false,
    //     accessKey: configService.get('MINIO_ACCESSKEY'),
    //     secretKey: configService.get('MINIO_SECRETKEY'),
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
  providers: [MinioClientService],
})
export class MinioClientModule {}
