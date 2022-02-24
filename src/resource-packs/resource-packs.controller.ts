import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ResourcePacksService } from './resource-packs.service';
import { CreateResourcePackDto } from './dto/create-resource-pack.dto';
import { UpdateResourcePackDto } from './dto/update-resource-pack.dto';

@Controller('resource-packs')
export class ResourcePacksController {
  constructor(private readonly resourcePacksService: ResourcePacksService) {}

  @Post()
  create(@Body() createResourcePackDto: CreateResourcePackDto) {
    return this.resourcePacksService.create(createResourcePackDto);
  }

  @Get()
  findAll() {
    return this.resourcePacksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourcePacksService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResourcePackDto: UpdateResourcePackDto,
  ) {
    return this.resourcePacksService.update(+id, updateResourcePackDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resourcePacksService.remove(+id);
  }
}
