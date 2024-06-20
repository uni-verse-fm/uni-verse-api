/* Copyright (c) 2022 uni-verse corp */

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
import { HotCommentsDto } from './dto/hot-comments.dto';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectModel(Comment.name)
    private commentModel: Model<CommentDocument>,
    private tracksService: TracksService,
    private resourcesService: ResourcesService,
  ) { }

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

  async removeComment(id: string, owner: UserDocument) {
    isValidId(id);
    this.logger.log(`Removing comment by id: ${id}`);
    const comment = await this.isUserTheOwnerOfComment(id, owner);

    await comment.deleteOne();
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
        throw new BadRequestException(`The type of content ${typeOfContent} is not valid.`);
    }
  }

  async hotTracksComments(params: HotCommentsDto) {
    this.logger.log(
      `Finding hot comments between ${params.startDate} and ${params.endDate}`,
    );
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

    if (params.startDate > params.endDate)
      throw new Error('Start date must be before end date');

    return await this.commentModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
          modelType: ModelType.Track,
        },
      },
      { $group: { _id: '$modelId', comments: { $sum: 1 } } },
      {
        $lookup: {
          from: 'tracks',
          localField: '_id',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'feats',
                foreignField: '_id',
                as: 'feats',
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                pipeline: [
                  {
                    $project: {
                      id: '$_id',
                      username: '$username',
                      email: '$email',
                      stripeAccountId: '$stripeAccountId',
                      donationProductId: '$donationProductId',
                      profilePicture: '$profilePicture',
                    },
                  },
                ],
                as: 'author',
              },
            },
            {
              $lookup: {
                from: 'releases',
                let: { track_id: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: ['$$track_id', '$tracks'],
                    },
                  },
                  {
                    $project: {
                      id: '$_id',
                      title: '$title',
                      coverName: '$coverName',
                    },
                  },
                ],
                as: 'release',
              },
            },
            {
              $project: {
                id: '$_id',
                title: '$title',
                feats: '$feats',
                fileName: '$fileName',
                isPlagia: '$isPlagia',
                isFeatsWaiting: '$isFeatsWaiting',
                author: { $first: '$author' },
                release: { $first: '$release' },
                createdAt: '$createdAt',
              },
            },
          ],
          as: 'track',
        },
      },
      {
        $project: {
          id: '$_id',
          title: { $first: '$track.title' },
          author: { $first: '$track.author' },
          fileName: { $first: '$track.fileName' },
          feats: { $first: '$track.feats' },
          release: { $first: '$track.release' },
          comments: { $sum: '$comments' },
          createdAt: { $first: '$track.createdAt' },
        },
      },
      { $sort: { comments: -1 } },
      { $limit: params.limit },
    ]);
  }
}
