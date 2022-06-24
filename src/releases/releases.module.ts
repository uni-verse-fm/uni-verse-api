import { Module } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import { ReleasesController } from './releases.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Release, ReleaseSchema } from './schemas/release.schema';
import { Track, TrackSchema } from '../tracks/schemas/track.schema';
import { FilesService } from '../files/files.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { TracksModule } from '../tracks/tracks.module';
import UsersModule from '../users/users.module';
import { MinioClientService } from '../minio-client/minio-client.service';
import { PaymentsService } from '../payments/payments.service';
import { SearchModule } from '../search/search.module';
import ReleasesSearchService from './releases-search.service';
import { RMQModule } from 'src/rmq-client/rmq-client.module';

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
    RMQModule,
  ],
  controllers: [ReleasesController],
  providers: [
    ReleasesService,
    FilesService,
    MinioClientService,
    PaymentsService,
    ReleasesSearchService,
  ],
  exports: [ReleasesService, ReleasesSearchService],
})
class ReleasesModule {}

export default ReleasesModule;
