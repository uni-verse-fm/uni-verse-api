import { Injectable, Logger } from '@nestjs/common';
import {
  BucketName,
  MinioClientService,
  ReadableFile,
} from '../minio-client/minio-client.service';
import { SimpleCreateFileDto } from './dto/simple-create-file.dto';
import AdmZip = require('adm-zip');

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
    const file = await this.minioClient.getFile(fileName, bucketName);
    const chunks = [];

    for await (const chunk of file) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    return buffer;
  }

  async getFilesZip(fileNames: string[], bucketName: BucketName) {
    this.logger.log(`Getting files zip`);
    const files = await this.minioClient
      .getFiles(fileNames, bucketName)
      .catch(() => {
        throw new Error("Can't get files");
      });

    try {
      const zip = new AdmZip();
      files.forEach(async (readableFile: ReadableFile) => {
        const chunks = [];
        var dataLen = 0;
        for await (const chunk of readableFile.readable) {
          chunks.push(chunk);
          dataLen += chunk.length;
        }
        zip.addFile(readableFile.fileName, Buffer.concat(chunks));
      });
      const buffer = zip.toBuffer();
      return buffer;
    } catch (error) {
      throw new Error(error);
    }
  }
}
