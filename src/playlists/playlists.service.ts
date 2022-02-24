import { Injectable } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Injectable()
export class PlaylistsService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createPlaylistDto: CreatePlaylistDto) {
    return 'This action adds a new playlist';
  }

  findAll() {
    return `This action returns all playlists`;
  }

  findOne(id: number) {
    return `This action returns a #${id} playlist`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updatePlaylistDto: UpdatePlaylistDto) {
    return `This action updates a #${id} playlist`;
  }

  remove(id: number) {
    return `This action removes a #${id} playlist`;
  }
}
