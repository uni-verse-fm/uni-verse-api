import { Injectable, Logger } from '@nestjs/common';
import {
  BucketName,
  MinioClientService,
} from '../minio-client/minio-client.service';
import { SimpleCreateFileDto } from './dto/simple-create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private minioClient: MinioClientService) {}

  async createFile(
    createFileDto: SimpleCreateFileDto,
    bucketName: BucketName,
  ): Promise<string> {
    this.logger.log(`Creating file ${createFileDto.originalFileName}`);
    return await this.minioClient.upload(createFileDto, bucketName);
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

  updateFile(id: string, _updateFileDto: UpdateFileDto) {
    this.logger.log(`Updating file ${id}`);
    return `This action updates a #${id} file`;
  }
}
