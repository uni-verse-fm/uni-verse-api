import { FilesModule } from './../files/files.module';
import { PaymentsModule } from './../payments/payments.module';
import { Module } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import { ReleasesController } from './releases.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Release, ReleaseSchema } from './schemas/release.schema';
import { Track, TrackSchema } from '../tracks/schemas/track.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { TracksModule } from '../tracks/tracks.module';
import UsersModule from '../users/users.module';
import { SearchModule } from '../search/search.module';
import ReleasesSearchService from './releases-search.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Release.name, schema: ReleaseSchema },
      { name: Track.name, schema: TrackSchema },
      { name: User.name, schema: UserSchema },
    ]),
    TracksModule,
    UsersModule,
    SearchModule,
    PaymentsModule,
    FilesModule,
  ],
  controllers: [ReleasesController],
  providers: [
    ReleasesService,
    ReleasesSearchService,
  ],
  exports: [ReleasesService, ReleasesSearchService],
})
class ReleasesModule {}

export default ReleasesModule;
