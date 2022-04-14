import { Injectable } from '@nestjs/common';
import {
  BucketName,
  MinioClientService,
} from '../minio-client/minio-client.service';
import { SimpleCreateFileDto } from './dto/simple-create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import IFileResponse from './interfaces/file-response.interface';

@Injectable()
export class FilesService {
  constructor(private minioClient: MinioClientService) {}

  async createFile(
    createFileDto: SimpleCreateFileDto,
    bucketName: BucketName,
  ): Promise<string> {
    return await this.minioClient.upload(createFileDto, bucketName);
  }

  findAllFiles() {
    return `This action returns all files`;
  }

  findFileById(id: string) {
    return `This action returns a #${id} file`;
  }

  updateFile(id: string, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  removeFile(id: number) {
    return `This action removes a #${id} file`;
  }
}
