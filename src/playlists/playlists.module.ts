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
import { PaymentsService } from '../payments/payments.service';
import UsersModule from '../users/users.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Playlist.name, schema: PlaylistSchema },
      { name: Track.name, schema: TrackSchema },
      { name: User.name, schema: UserSchema },
    ]),
    TracksModule,
    UsersModule
  ],
  controllers: [PlaylistsController],
  providers: [
    PlaylistsService,
    TracksService,
    MinioClientService,
    FilesService,
    PaymentsService,
  ],
  exports: [PlaylistsService],
})
export class PlaylistsModule {}
