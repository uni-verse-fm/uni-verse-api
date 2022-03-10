import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReleasesService } from './releases.service';

@Controller('releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Get()
  find(@Query('title') title: string) {
    return this.releasesService.find(title);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.releasesService.findOne(id);
  }
}
