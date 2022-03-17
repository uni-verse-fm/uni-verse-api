import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import IFileResponse from './interfaces/file-response.interface';

@Injectable()
export class FilesService {
    create(createFileDto: CreateFileDto): IFileResponse {
        console.log(createFileDto);
        return {
            fileName: "example",
            trackFileUrl: "https://track-example.com"
        }
    }

    findAll() {
        return `This action returns all files`;
    }

    findOne(id: number) {
        return `This action returns a #${id} file`;
    }

    update(id: number, updateFileDto: UpdateFileDto) {
        return `This action updates a #${id} file`;
    }

    remove(id: number) {
        return `This action removes a #${id} file`;
    }
}
