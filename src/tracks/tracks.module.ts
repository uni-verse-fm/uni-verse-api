import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Track, TrackSchema } from './schemas/track.schema';
import { FilesService } from '../files/files.service';
import { UsersService } from '../users/users.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { MinioClientService } from '../minio-client/minio-client.service';
import { PaymentsService } from '../payments/payments.service';
import UsersModule from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Track.name, schema: TrackSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
  ],
  controllers: [],
  providers: [TracksService, MinioClientService, FilesService, PaymentsService],
  exports: [TracksService],
})
export class TracksModule {}
