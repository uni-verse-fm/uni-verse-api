import { FilesModule } from './../files/files.module';
import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Track, TrackSchema } from './schemas/track.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { TracksController } from './tracks.controller';
import UsersModule from '../users/users.module';
import TracksSearchService from './tracks-search.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Track.name, schema: TrackSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
    SearchModule,
    FilesModule,
  ],
  controllers: [TracksController],
  providers: [TracksService, TracksSearchService],
  exports: [TracksService, TracksSearchService],
})
export class TracksModule {}
