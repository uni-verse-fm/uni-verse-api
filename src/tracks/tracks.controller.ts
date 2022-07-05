/* Copyright (c) 2022 uni-verse corp */

import {
  Controller,
  Get,
  Query,
  Patch,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FpSearchInterceptor } from '../utils/interceptors/fp-search.interceptor';
import { ValidIdInterceptor } from '../utils/interceptors/valid-id.interceptor';
import { TracksService } from './tracks.service';

@ApiTags('tracks')
@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get('/search')
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Search user' })
  searchTracks(@Query('search') search: string) {
    if (search) return this.tracksService.searchTrack(search);
    return [];
  }

  @Patch(':id/:secret')
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'INTERNAL: updates a fingerprint search.' })
  @UseInterceptors(FpSearchInterceptor, ValidIdInterceptor)
  @ApiExcludeEndpoint()
  update(@Param('id') id: string) {
    return this.tracksService.plagiateTrack(id);
  }
}
