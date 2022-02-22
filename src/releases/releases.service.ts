import { Injectable } from '@nestjs/common';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';

@Injectable()
export class ReleasesService {
  create(createReleaseDto: CreateReleaseDto) {
    return 'This action adds a new release';
  }

  findAll() {
    return `This action returns all releases`;
  }

  findOne(id: number) {
    return `This action returns a #${id} release`;
  }

  update(id: number, updateReleaseDto: UpdateReleaseDto) {
    return `This action updates a #${id} release`;
  }

  remove(id: number) {
    return `This action removes a #${id} release`;
  }
}
