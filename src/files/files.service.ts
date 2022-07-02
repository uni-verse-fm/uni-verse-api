import { Injectable, Logger } from '@nestjs/common';
import {
  BucketName,
  MinioClientService,
  ReadableFile,
} from '../minio-client/minio-client.service';
import { SimpleCreateFileDto } from './dto/simple-create-file.dto';
import AdmZip from 'adm-zip';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private minioClient: MinioClientService) {}

  async createFile(
    createFileDto: SimpleCreateFileDto,
    bucketName: BucketName,
    callBack?: (filename: string) => void,
  ): Promise<string> {
    this.logger.log(`Creating file ${createFileDto.originalFileName}`);
    const res = await this.minioClient.upload(createFileDto, bucketName);
    callBack && callBack(res);
    return res;
  }

  async removeFile(fileName: string, bucketName: BucketName) {
    this.logger.log(`Removing file ${fileName} from ${bucketName}`);
    return await this.minioClient.delete(fileName, bucketName);
  }

  findAllFiles() {
    this.logger.log('Finding all files');
    return `This action returns all files`;
  }

  async findFileByName(fileName: string, bucketName: BucketName) {
    this.logger.log(`Finding file ${fileName}`);
    return await this.minioClient.getFile(fileName, bucketName);
  }

  async getFilesZip(fileNames: string[], bucketName: BucketName) {
    this.logger.log(`Getting files zip`);
    const files = await this.minioClient.getFiles(fileNames, bucketName);

    const zip = new AdmZip();
    const chunks = [];

    files.forEach(async (readableFile: ReadableFile) => {
      for await (const chunk of readableFile.readable) {
        chunks.push(chunk);
      }
      zip.addFile(readableFile.fileName, Buffer.concat(chunks));
    });
    return zip.toBuffer();
  }
}
