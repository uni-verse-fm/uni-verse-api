import { Controller, Get, Param, Response, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TracksService } from './tracks.service';

@ApiTags('tracks')
@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get(':trackId')
  async getFile(@Response({ passthrough: true }) res, @Param('trackId') trackId: string): Promise<StreamableFile> {
      const fileInfo = await this.tracksService.streamTrack(trackId)
    res.set({
      'Content-Type': 'audio/mp3',
      'Content-Disposition': `attachment; filename="${fileInfo.fileName}.mp3"`,
    });
    return new StreamableFile(fileInfo.file);
  }
}
