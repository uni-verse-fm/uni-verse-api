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
  UseInterceptors,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';
import { ValidIdInterceptor } from '../utils/interceptors/valid-id.interceptor';

@ApiTags('playlists')
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Publish a playlist' })
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
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Find all playlists or one playlist by title' })
  @ApiQuery({ name: 'title', required: false })
  find(@Query('title') title: string) {
    return this.playlistsService.find(title);
  }

  @Get('/search')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Search user' })
  searchUsers(@Query('search') search: string) {
    if (search) return this.playlistsService.searchPlaylist(search);
    return [];
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Find one playlist by id' })
  @UseInterceptors(ValidIdInterceptor)
  findOne(@Param('id') id: string) {
    return this.playlistsService.findPlaylistById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Update title and add or delete tracks' })
  @UseInterceptors(ValidIdInterceptor)
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
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Delete a playlist' })
  @UseInterceptors(ValidIdInterceptor)
  remove(@Param('id') id: string, @Request() request: IRequestWithUser) {
    return this.playlistsService.removePlaylist(id, request.user);
  }
}
