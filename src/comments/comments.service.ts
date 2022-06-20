import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResourcesService } from '../resources/resources.service';
import { ResourceDocument } from '../resources/schemas/resource.schema';
import { TrackDocument } from '../tracks/schemas/track.schema';
import { TracksService } from '../tracks/tracks.service';
import { UserDocument } from '../users/schemas/user.schema';
import { isValidId } from '../utils/is-valid-id';
import { CreateCommentDto, ModelType } from './dto/create-comment.dto';
import { FindResourceCommentDto } from './dto/find-resource-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectModel(Comment.name)
    private commentModel: Model<CommentDocument>,
    private tracksService: TracksService,
    private resourcesService: ResourcesService,
  ) {}

  async createComment(createCommentDto: CreateCommentDto, owner: UserDocument) {
    this.logger.log(`Creating comment for ${createCommentDto.typeOfContent}`);

    const contentType: TrackDocument | ResourceDocument =
      await this.getResource(
        createCommentDto.typeOfContent,
        createCommentDto.contentId,
      );

    const createComment = {
      ...createCommentDto,
      owner,
      modelId: contentType._id,
      modelType: createCommentDto.typeOfContent,
    };

    const comment = new this.commentModel(createComment);

    try {
      const savedComment = await comment.save();
      return savedComment;
    } catch (err) {
      this.logger.error(`Can not create comment due to: ${err}`);
      throw new BadRequestException(err.message);
    }
  }

  async findAllComments() {
    this.logger.log('Finding all comments');
    return await this.commentModel.find();
  }

  async findCommentById(id: string) {
    isValidId(id);
    this.logger.log(`Finding comment by id: ${id}`);
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      this.logger.error(`Comment with ID "${id}" not found`);
      throw new NotFoundException(`Comment with ID "${id}" not found.`);
    }
    return comment;
  }

  async findResourceComments(resourceInfo: FindResourceCommentDto) {
    this.logger.log(`Finding comment of resource: ${resourceInfo.contentId}`);
    isValidId(resourceInfo.contentId);

    const contentType: TrackDocument | ResourceDocument =
      await this.getResource(
        resourceInfo.typeOfContent,
        resourceInfo.contentId,
      );

    return await this.commentModel
      .find({ modelId: contentType._id, modelType: resourceInfo.typeOfContent })
      .populate('owner')
      .catch(() => {
        this.logger.error(
          `Can not find comments of resource with ID "${contentType._id}"`,
        );
        throw new NotFoundException(
          `Can not find comments of resource with ID "${contentType._id}"`,
        );
      });
  }

  updateComment(
    id: string,
    _updateCommentDto: UpdateCommentDto,
    _owner: UserDocument,
  ) {
    isValidId(id);
    this.logger.log(`Updating comment by id: ${id}`);
    return `This action updates a #${id} comment`;
  }

  async removeComment(id: string, owner: UserDocument) {
    isValidId(id);
    this.logger.log(`Removing comment by id: ${id}`);
    const comment = await this.isUserTheOwnerOfComment(id, owner);

    await comment.remove();
    return {
      msg: `Comment ${comment._id.toString()} deleted`,
    };
  }

  private async isUserTheOwnerOfComment(id: string, owner: UserDocument) {
    isValidId(id);
    const comment = await this.findCommentById(id);
    if (!comment) {
      this.logger.error(`Comment with ID "${id}" not found`);
      throw new NotFoundException('Somthing wrong with the server');
    }
    if (comment.owner._id.toString() !== owner._id.toString()) {
      this.logger.error(`ID "${id}" You are not the owner of comment ${id}.`);
      throw new BadRequestException('You are not the owner of this comment.');
    }
    return comment;
  }

  private async getResource(
    typeOfContent: ModelType,
    contentId: string,
  ): Promise<ResourceDocument | TrackDocument> {
    switch (typeOfContent) {
      case ModelType.Track:
        return await this.tracksService.findTrackById(contentId);
      case ModelType.Resource:
        return await this.resourcesService.findResourceById(contentId);
      default:
        throw new BadRequestException('The type of content is not valid.');
    }
  }
}
