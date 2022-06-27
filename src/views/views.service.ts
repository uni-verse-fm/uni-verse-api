import { PeriodViewsDto } from './dto/period-views.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateViewDto } from './dto/create-view.dto';
import { View, ViewDocument } from './schemas/view.schema';
import { Model } from 'mongoose';
import { HotViewsDto } from './dto/hots-views.dto';

@Injectable()
export class ViewsService {
  private readonly logger: Logger = new Logger(ViewsService.name);

  constructor(
    @InjectModel(View.name)
    private viewModel: Model<ViewDocument>,
  ) {}

  async createView(createViewDto: CreateViewDto) {
    this.logger.log(`Creating view for track ${createViewDto.trackId}`);

    const newView = new this.viewModel({ track: createViewDto.trackId });

    return await newView.save().catch(() => {
      this.logger.error('Error creating view');
      throw new Error('Error creating view');
    });
  }

  async findViewsByUserId(userId: string) {
    this.logger.log(`Finding views of user  ${userId}`);
    return await this.viewModel
      .find({ user: userId })
      .count()
      .catch(() => {
        this.logger.error('Error finding views');
        throw new Error('Error finding view');
      });
  }

  async countViewsByUserId(userId: string) {
    this.logger.log(`Finding views of user  ${userId}`);
    return await this.viewModel
      .find({ user: userId })
      .count()
      .catch(() => {
        this.logger.error('Error finding views');
        throw new Error('Error finding views');
      });
  }

  async countViewsByTrackId(trackId: string) {
    this.logger.log(`Finding count of views of track ${trackId}`);
    return await this.viewModel
      .find({ track: trackId })
      .count()
      .catch(() => {
        this.logger.error('Error counting views');
        throw new Error('Error counting views');
      });
  }

  async periodCountViewsByTrackId(periodViews: PeriodViewsDto) {
    this.logger.log(
      `Finding count of views of track ${periodViews.trackId} between ${
        periodViews.startDate.toISOString().split('T')[0]
      } and ${periodViews.endDate.toISOString().split('T')[0]}`,
    );

    if (periodViews.startDate > periodViews.endDate)
      throw new Error('Start date must be before end date');

    return await this.viewModel
      .find({
        track: periodViews.trackId,
        createdAt: {
          $gte: periodViews.startDate,
          $lt: periodViews.endDate,
        },
      })
      .count()
      .catch(() => {
        this.logger.error('Error counting views');
        throw new Error('Error counting views');
      });
  }

  async hotViews(params: HotViewsDto) {
    this.logger.log(
      `Finding hot views between ${params.startDate} and ${params.endDate}`,
    );
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

    this.logger.debug(`Start date: ${startDate}`);
    this.logger.debug(`End date: ${endDate}`);

    if (params.startDate > params.endDate)
      throw new Error('Start date must be before end date');

    return await this.viewModel.aggregate([
      {
        $match: { createdAt: { $gte: startDate, $lt: endDate } },
      },
      { $group: { _id: '$track', views: { $sum: 1 } } },
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
          views: { $sum: '$views' },
          createdAt: { $first: '$track.createdAt' },
        },
      },
      { $sort: { views: -1 } },
      { $limit: params.limit },
    ]);
  }
}
