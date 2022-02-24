import { Injectable } from '@nestjs/common';
import { CreateResourcePackDto } from './dto/create-resource-pack.dto';
import { UpdateResourcePackDto } from './dto/update-resource-pack.dto';

@Injectable()
export class ResourcePacksService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createResourcePackDto: CreateResourcePackDto) {
    return 'This action adds a new resourcePack';
  }

  findAll() {
    return `This action returns all resourcePacks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} resourcePack`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateResourcePackDto: UpdateResourcePackDto) {
    return `This action updates a #${id} resourcePack`;
  }

  remove(id: number) {
    return `This action removes a #${id} resourcePack`;
  }
}
