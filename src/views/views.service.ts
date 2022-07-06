/* Copyright (c) 2022 uni-verse corp */

import { PeriodViewsDto } from './dto/period-views.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateViewDto } from './dto/create-view.dto';
import { View, ViewDocument } from './schemas/view.schema';
import { Model } from 'mongoose';
import { HotViewsDto } from './dto/hots-views.dto';
import { TracksService } from '../tracks/tracks.service';

@Injectable()
export class ViewsService {
  private readonly logger: Logger = new Logger(ViewsService.name);

  constructor(
    @InjectModel(View.name)
    private viewModel: Model<ViewDocument>,
    private tracksService: TracksService,
  ) {}

  async createView(createViewDto: CreateViewDto) {
    this.logger.log(`Creating view for track ${createViewDto.track}`);

    const newView = new this.viewModel({
      track: createViewDto.track,
      user: createViewDto.user,
    });

    return await newView.save().catch(() => {
      this.logger.error('Error creating view');
      throw new Error('Error creating view');
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

  async findViewsByUserId(userId: string) {
    this.logger.log(`Finding views of user  ${userId}`);
    const ids = await this.tracksService
      .findTracksByUserId(userId)
      .then((tracks) => tracks.map((track) => track._id));
    console.log(ids);
    return await this.viewModel.aggregate([
      {
        $match: {
          track: {
            $in: ids,
          },
        },
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
                from: 'users',
                localField: 'feats',
                foreignField: '_id',
                as: 'feats',
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
          views: { $sum: '$views' },
          createdAt: { $first: '$track.createdAt' },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 5 },
    ]);
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

  async hotTracks(params: HotViewsDto) {
    this.logger.log(
      `Finding hot views between ${params.startDate} and ${params.endDate}`,
    );
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

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
          views: { $sum: '$views' },
          createdAt: { $first: '$track.createdAt' },
        },
      },
      { $sort: { views: -1 } },
      { $limit: params.limit },
    ]);
  }

  async hotReleases(params: HotViewsDto) {
    this.logger.log(
      `Finding hot releases between ${params.startDate} and ${params.endDate}`,
    );
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

    if (params.startDate > params.endDate)
      throw new Error('Start date must be before end date');

    return await this.viewModel.aggregate([
      {
        $match: { createdAt: { $gte: startDate, $lt: endDate } },
      },
      {
        $group: {
          _id: { release: '$release', track: '$track' },
          views: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'releases',
          localField: '_id.release',
          foreignField: '_id',
          pipeline: [
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
              $project: {
                id: '$_id',
                title: '$title',
                author: { $first: '$author' },
                coverName: '$coverName',
                createdAt: '$createdAt',
              },
            },
          ],
          as: 'release',
        },
      },
      {
        $lookup: {
          from: 'tracks',
          localField: '_id.track',
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
              $project: {
                id: '$_id',
                title: '$title',
                feats: '$feats',
                fileName: '$fileName',
                isPlagia: '$isPlagia',
                isFeatsWaiting: '$isFeatsWaiting',
                createdAt: '$createdAt',
              },
            },
          ],
          as: 'track',
        },
      },
      {
        $project: {
          id: '$_id.release',
          title: { $first: '$release.title' },
          author: { $first: '$release.author' },
          coverName: { $first: '$release.coverName' },
          tracks: '$track',
          views: { $sum: '$views' },
          createdAt: { $first: '$release.createdAt' },
        },
      },
      { $sort: { views: -1 } },
      { $limit: params.limit },
    ]);
  }
}
