import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Playlist, PlaylistSchema } from './schemas/playlist.schema';
import { TracksService } from '../tracks/tracks.service';
import { Track, TrackSchema } from '../tracks/schemas/track.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { TracksModule } from '../tracks/tracks.module';
import { FilesService } from '../files/files.service';
import { MinioClientService } from '../minio-client/minio-client.service';
import { UsersService } from '../users/users.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Playlist.name, schema: PlaylistSchema },
      { name: Track.name, schema: TrackSchema },
      { name: User.name, schema: UserSchema },
    ]),
    TracksModule,    
  ],
  controllers: [PlaylistsController],
  providers: [
    PlaylistsService, 
    TracksService,
    MinioClientService, 
    FilesService,
    UsersService,
    ],
  exports: [PlaylistsService],
})
export class PlaylistsModule {}
