import { Injectable } from '@nestjs/common';
import { SimpleCreateFileDto } from './dto/simple-create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import IFileResponse from './interfaces/file-response.interface';
import { BucketName } from './minio.service';

@Injectable()
export class FilesService {
  create(createFileDto: SimpleCreateFileDto, bucketName: BucketName): IFileResponse {
    return {
      fileName: 'example',
      fileUrl: 'https://www.example.com',
    };
  }

  findAll() {
    return `This action returns all files`;
  }

  findOne(id: string) {
    return `This action returns a #${id} file`;
  }

  update(id: string, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
