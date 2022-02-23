import { Injectable } from '@nestjs/common';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';

@Injectable()
export class ReleasesService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createReleaseDto: CreateReleaseDto) {
    return 'This action adds a new release';
  }

  findAll() {
    return `This action returns all releases`;
  }

  findOne(id: number) {
    return `This action returns a #${id} release`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateReleaseDto: UpdateReleaseDto) {
    return `This action updates a #${id} release`;
  }

  remove(id: number) {
    return `This action removes a #${id} release`;
  }
}
