import { ResourcesModule } from './../resources/resources.module';
import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema, Comment } from './schemas/comment.schema';
import { Track, TrackSchema } from '../tracks/schemas/track.schema';
import { Resource, ResourceSchema } from '../resources/schemas/resource.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import UsersModule from '../users/users.module';
import { TracksModule } from '../tracks/tracks.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Track.name, schema: TrackSchema },
      { name: Resource.name, schema: ResourceSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
    TracksModule,
    ResourcesModule,
    SearchModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
  ],
  exports: [CommentsService],
})
export class CommentsModule {}
