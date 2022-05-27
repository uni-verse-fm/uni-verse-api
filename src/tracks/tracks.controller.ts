import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TracksService } from './tracks.service';

@ApiTags('tracks')
@Controller('tracks')
export class TracksController {
  private readonly logger: Logger = new Logger(TracksController.name);

  constructor(private readonly tracksService: TracksService) {}

  @Get('/search')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Search user' })
  searchUsers(@Query('search') search: string) {
    if (search) return this.tracksService.searchTrack(search);
    return [];
  }
}
