/* Copyright (c) 2022 uni-verse corp */

import { FilesModule } from './../files/files.module';
import { forwardRef, Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Track, TrackSchema } from './schemas/track.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { TracksController } from './tracks.controller';
import UsersModule from '../users/users.module';
import TracksSearchService from './tracks-search.service';
import { SearchModule } from '../search/search.module';
import { RMQModule } from 'src/rmq-client/rmq-client.module';
import { FeatRequestsModule } from './../feat-requests/feat-requests.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Track.name, schema: TrackSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
    SearchModule,
    forwardRef(() => FeatRequestsModule),
    FilesModule,
    RMQModule,
  ],
  controllers: [TracksController],
  providers: [TracksService, TracksSearchService],
  exports: [TracksService, TracksSearchService],
})
export class TracksModule {}
