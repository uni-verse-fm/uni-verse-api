import { Controller, Get, Query, Logger } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TracksService } from './tracks.service';

@ApiTags('tracks')
@Controller('tracks')
export class TracksController {
  private readonly logger: Logger = new Logger(TracksController.name);

  constructor(private readonly tracksService: TracksService) {}

  @Get('/search')
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Search user' })
  searchTracks(@Query('search') search: string) {
    if (search) return this.tracksService.searchTrack(search);
    return [];
  }
}
