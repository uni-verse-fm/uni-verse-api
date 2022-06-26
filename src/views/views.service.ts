import { PeriodViewsDto } from './dto/period-views.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateViewDto } from './dto/create-view.dto';
import { View, ViewDocument } from './schemas/view.schema';
import { Model } from 'mongoose';

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
}
