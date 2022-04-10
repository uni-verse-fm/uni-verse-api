import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { ApiCookieAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Publish a playlist' })
  @ApiCookieAuth('Set-Cookie')
  create(
    @Body() createPlaylistDto: CreatePlaylistDto,
    @Request() request: IRequestWithUser,
  ) {
    return this.playlistsService.createPlaylist(
      createPlaylistDto,
      request.user,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Find all playlists or one playlist by title' })
  @ApiQuery({ name: 'title', required: false })
  find(@Query('title') title: string) {
    return this.playlistsService.find(title);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playlistsService.findPlaylistById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
    @Request() request: IRequestWithUser,
  ) {
    return this.playlistsService.updatePlaylist(
      id,
      updatePlaylistDto,
      request.user,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() request: IRequestWithUser) {
    return this.playlistsService.removePlaylist(id, request.user);
  }
}