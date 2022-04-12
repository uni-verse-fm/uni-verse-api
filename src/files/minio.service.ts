import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import * as crypto from 'crypto';
import { SimpleCreateFileDto } from './dto/simple-create-file.dto';

export enum BucketName {
  Resources = 'resources',
  Tracks = 'tracks',
}

@Injectable()
export class MinioClientService {
  constructor(private readonly minio: MinioService) {
    this.logger = new Logger('MinioService');
  }

  private readonly logger: Logger;

  public get client() {
    return this.minio.client;
  }

  public async upload(file: SimpleCreateFileDto, bucketName: BucketName) {
    const timestamp = Date.now().toString();
    const hashedFileName = crypto
      .createHash('md5')
      .update(timestamp)
      .digest('hex');
    const extension = file.fileName.substring(
      file.fileName.lastIndexOf('.'),
      file.fileName.length,
    );
    const metaData = {
      'Content-Type': file.mimetype,
    };

    // We need to append the extension at the end otherwise Minio will save it as a generic file
    const fileName = hashedFileName + extension;

    this.client.putObject(
      bucketName,
      fileName,
      file.buffer,
      file.size,
      metaData,
      (err: any) => {
        if (err) {
          throw new BadRequestException('Error uploading file');
        }
      },
    );

    return {
      url: `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${fileName}`,
    };
  }

  async getFile(fileName: string, bucketName: BucketName) {
    return this.client.getObject(bucketName, fileName, (err, data) => {
      if (err)
        throw new BadRequestException('An error occured when getting file!');
      data;
    });
  }

  async delete(objetName: string, bucketName: BucketName) {
    this.client.removeObject(bucketName, objetName, (err) => {
      if (err) throw new BadRequestException('An error occured when deleting!');
    });
  }

  async listAllBuckets() {
    return this.client.listBuckets();
  }
}
