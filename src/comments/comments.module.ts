import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema, Comment } from './schemas/comment.schema';
import { Track, TrackSchema } from '../tracks/schemas/track.schema';
import { Resource, ResourceSchema } from '../resources/schemas/resource.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { TracksService } from '../tracks/tracks.service';
import { ResourcesService } from '../resources/resources.service';
import { MinioClientService } from '../minio-client/minio-client.service';
import { FilesService } from '../files/files.service';
import { UsersService } from '../users/users.service';
import { PaymentsService } from '../payments/payments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Track.name, schema: TrackSchema },
      { name: Resource.name, schema: ResourceSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    TracksService,
    ResourcesService,
    MinioClientService,
    FilesService,
    UsersService,
    PaymentsService,
  ],
  exports: [CommentsService],
})
export class CommentsModule {}
