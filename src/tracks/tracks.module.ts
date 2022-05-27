import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Track, TrackSchema } from './schemas/track.schema';
import { FilesService } from '../files/files.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { MinioClientService } from '../minio-client/minio-client.service';
import { PaymentsService } from '../payments/payments.service';
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
  ],
  controllers: [TracksController],
  providers: [
    TracksService,
    MinioClientService,
    FilesService,
    PaymentsService,
    TracksSearchService,
  ],
  exports: [TracksService, TracksSearchService],
})
export class TracksModule {}
