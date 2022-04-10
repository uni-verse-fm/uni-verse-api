import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Playlist, PlaylistSchema } from './schemas/playlist.schema';
import { TracksService } from '../tracks/tracks.service';
import { Track, TrackSchema } from '../tracks/schemas/track.schema';
import { FilesService } from '../files/files.service';
import { UsersService } from '../users/users.service';
import { User, UserSchema } from '../users/schemas/user.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Playlist.name, schema: PlaylistSchema },
      { name: Track.name, schema: TrackSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [PlaylistsController],
  providers: [PlaylistsService, TracksService, FilesService, UsersService],
})
export class PlaylistsModule {}
