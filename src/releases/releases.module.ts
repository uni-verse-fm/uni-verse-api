import { Module } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import { ReleasesController } from './releases.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Release, ReleaseSchema } from './schemas/release.schema';
import { TracksService } from '../tracks/tracks.service';
import { Track, TrackSchema } from '../tracks/schemas/track.schema';
import { FilesService } from '../files/files.service';
import { UsersService } from '../users/users.service';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
        { name: Release.name, schema: ReleaseSchema }
    ]),
    MongooseModule.forFeature([{ name: Track.name, schema: TrackSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ReleasesController],
  providers: [ReleasesService, UsersService, TracksService, FilesService],
  exports: [ReleasesService],
})
class ReleasesModule {}

export default ReleasesModule;
