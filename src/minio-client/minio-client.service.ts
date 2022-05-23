import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SimpleCreateFileDto } from '../files/dto/simple-create-file.dto';
import * as crypto from 'crypto';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

export enum BucketName {
  Resources = 'resources',
  Tracks = 'tracks',
  Images = 'images',
}

@Injectable()
export class MinioClientService {
  private readonly logger: Logger = new Logger(MinioClientService.name);

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT'),
      port: this.configService.get('MINIO_PORT'),
      useSSL: false,
      accessKey: this.configService.get('MINIO_ROOT_USER'),
      secretKey: this.configService.get('MINIO_ROOT_PASSWORD'),
    });
  }

  private readonly minioClient: Minio.Client;

  public get client() {
    return this.minioClient;
  }

  public async upload(file: SimpleCreateFileDto, bucketName: BucketName) {
    this.logger.log(`Uploading file ${file.originalFileName}`);
    const timestamp = Date.now().toString();
    const hashedFileName = crypto
      .createHash('md5')
      .update(timestamp)
      .digest('hex');
    const extension = file.originalFileName.substring(
      file.originalFileName.lastIndexOf('.'),
      file.originalFileName.length,
    );

    const fileName = hashedFileName + extension;

    const metaData = {
      'Content-Type': file.mimetype,
    };

    this.client.putObject(
      bucketName,
      fileName,
      file.buffer,
      file.size,
      metaData,
      (err: any) => {
        if (err) {
          this.logger.error(
            `Can not upload file ${file.originalFileName} due to ${err}`,
          );
          throw new BadRequestException('Error uploading file', err);
        }
      },
    );

    return fileName;
  }

  async getFile(fileName: string, bucketName: BucketName): Promise<Readable> {
    this.logger.log(`Getting file ${fileName}`);
    try {
        const file = await this.client.getObject(bucketName, fileName);
        return file;
    } catch (error) {
        throw new BadRequestException('An error occured when getting file!');
    }
  }

  async delete(objetName: string, bucketName: BucketName) {
    this.logger.log(`Deleting file ${objetName}`);
    this.client.removeObject(bucketName, objetName, (err) => {
      if (err) {
        this.logger.error(`Can not delete file ${objetName} due to ${err}`);
        throw new BadRequestException('An error occured when deleting!');
      }
    });
  }

  async listAllBuckets() {
    this.logger.error(`Listing all buckets`);
    return this.client.listBuckets();
  }
}
