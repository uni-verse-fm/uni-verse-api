import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioModule } from 'nestjs-minio-client';
import { FilesService } from './files.service';

@Module({
    imports: [
        MinioModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                endPoint: configService.get('MINIO_ENDPOINT'),
                port: configService.get('MINIO_PORT'),
                useSSL: false,
                accessKey: configService.get('MINIO_ACCESSKEY'),
                secretKey: configService.get('MINIO_SECRETKEY')
            }),
            inject: [ConfigService],
        }),
    ],
  controllers: [],
  providers: [FilesService],
})
export class FilesModule {}
