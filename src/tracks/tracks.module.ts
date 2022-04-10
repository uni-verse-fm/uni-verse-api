import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Track, TrackSchema } from './schemas/track.schema';
import { FilesService } from '../files/files.service';
import { FilesModule } from '../files/files.module';
import { UsersService } from '../users/users.service';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Track.name, schema: TrackSchema },
      { name: User.name, schema: UserSchema },
    ]),
    FilesModule,
  ],
  controllers: [],
  providers: [TracksService, FilesService, UsersService],
})
export class TracksModule {}
