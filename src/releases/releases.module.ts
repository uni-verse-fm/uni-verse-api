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
import { TracksModule } from '../tracks/tracks.module';
import UsersModule from '../users/users.module';
import { MinioClientService } from '../minio-client/minio-client.service';
import { PaymentsService } from '../payments/payments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Release.name, schema: ReleaseSchema },
      { name: Track.name, schema: TrackSchema },
      { name: User.name, schema: UserSchema },
    ]),
    TracksModule,
    UsersModule,
  ],
  controllers: [ReleasesController],
  providers: [
    ReleasesService,
    UsersService,
    TracksService,
    FilesService,
    MinioClientService,
    PaymentsService
  ],
  exports: [ReleasesService],
})
class ReleasesModule {}

export default ReleasesModule;
