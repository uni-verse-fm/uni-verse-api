import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResourcesService } from '../resources/resources.service';
import { ResourceDocument } from '../resources/schemas/resource.schema';
import { TrackDocument } from '../tracks/schemas/track.schema';
import { TracksService } from '../tracks/tracks.service';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateCommentDto, ModelType } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: Model<CommentDocument>,
    private tracksService: TracksService,
    private resourcesService: ResourcesService,
  ) {}

  async createComment(createCommentDto: CreateCommentDto, owner: UserDocument) {
    let contentType: TrackDocument | ResourceDocument;

    switch (createCommentDto.typeOfContent) {
      case ModelType.TRACK:
        contentType = await this.tracksService.findTrackById(
          createCommentDto.contentId,
        );
        break;
      case ModelType.RESOURCE:
        contentType = await this.resourcesService.findResourceById(
          createCommentDto.contentId,
        );
        break;
      default:
        throw new BadRequestException('The type of content is not valid.');
    }

    const createComment = {
      ...createCommentDto,
      owner,
      modelId: contentType._id,
      modelType: createCommentDto.typeOfContent,
    };

    const comment = new this.commentModel(createComment);

    const savedComment = await comment.save();
    return savedComment;
  }

  async findAllComments() {
    return await this.commentModel.find();
  }

  async findCommentById(id: string) {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found.`);
    }
    return comment;
  }

  updateComment(
    id: string,
    updateCommentDto: UpdateCommentDto,
    owner: UserDocument,
  ) {
    return `This action updates a #${id} comment`;
  }

  async removeComment(id: string, owner: UserDocument) {
    const comment = await this.isUserTheOwnerOfComment(id, owner);

    await this.commentModel.deleteOne({ id: comment._id });
    return {
      msg: `Comment ${comment._id.toString()} deleted`,
    };
  }

  private async isUserTheOwnerOfComment(id: string, owner: UserDocument) {
    const comment = await this.findCommentById(id);
    if (!comment) {
      throw new NotFoundException('Somthing wrong with the server');
    }
    if (comment.owner._id.toString() !== owner._id.toString()) {
      throw new BadRequestException('You are not the owner of this comment.');
    }
    return comment;
  }
}
