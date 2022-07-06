import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateFeatRequestDto } from './dto/create-feat-request.dto';
import {
  FeatRequest,
  FeatRequestDocument,
} from './schemas/request-feat.schema';
import { Model } from 'mongoose';
import { TracksService } from '../tracks/tracks.service';

@Injectable()
export class FeatRequestsService {
  private readonly logger = new Logger(FeatRequestsService.name);

  constructor(
    @InjectModel(FeatRequest.name)
    private featRequestModel: Model<FeatRequestDocument>,
    @Inject(forwardRef(() => TracksService))
    private tracksService: TracksService,
  ) {}

  async createFeatRequest(
    createFeatRequestDto: CreateFeatRequestDto,
  ): Promise<string> {
    this.logger.log(
      `Creating feat for ${createFeatRequestDto.user} of ${createFeatRequestDto.track}`,
    );

    const featRequest = new this.featRequestModel(createFeatRequestDto);

    return await featRequest
      .save()
      .then((response) => response._id.toString())
      .catch(() => {
        throw new BadRequestException('Can not create feat request');
      });
  }

  async findUserReceivedFeatRequest(destId: string) {
    this.logger.log(`Finding user ${destId} feat requests`);

    return await this.featRequestModel.find({ dest: destId }).catch(() => {
      this.logger.error(
        `Can not find recieved feat requests of user with ID "${destId}"`,
      );
      throw new NotFoundException(
        `Can not find recieved feat requests of user with ID "${destId}"`,
      );
    });
  }

  async findUserSentFeatRequests(userId: string) {
    this.logger.log(`Finding user ${userId} feat requests`);

    return await this.featRequestModel.find({ user: userId }).catch(() => {
      this.logger.error(
        `Can not find sent feat requests of user with ID "${userId}"`,
      );
      throw new NotFoundException(
        `Can not find sent feat requests of user with ID "${userId}"`,
      );
    });
  }

  async findFeatRequestById(id: string): Promise<FeatRequestDocument> {
    this.logger.log(`Finding feat request ${id}`);

    return await this.featRequestModel.findById(id).catch(() => {
      this.logger.error(`Can not find feat request with ID "${id}"`);
      throw new NotFoundException(`Can not find feat request with ID "${id}"`);
    });
  }

  async findFeatRequestByDestIdAndTrackId(dest: string, trackId: string) {
    this.logger.log(
      `Finding track ${trackId} feat requests for dest user ${dest}`,
    );

    return await this.featRequestModel
      .find({ dest, track: trackId })
      .catch(() => {
        this.logger.error(
          `Can not find feat requests of track with ID "${trackId}"`,
        );
        throw new NotFoundException(
          `Can not find feat requests of track with ID "${trackId}"`,
        );
      });
  }

  async acceptFeatRequest(userId: string, requestId: string) {
    this.logger.log(`Accepting request ${requestId}`);

    const featRequest = await this.findFeatRequestById(requestId);
    const trackRequests = await this.findFeatRequestByDestIdAndTrackId(
      userId,
      featRequest.track.toString(),
    );
    if (trackRequests.length === 0) throw new NotFoundException('No requests');

    if (trackRequests.length === 1)
      return await this.tracksService
        .acceptFeatRequest(featRequest.track.toString())
        .then(async () => await this.removeFeatRequest(requestId))
        .then(() => ({ id: requestId, msg: 'Feat request accepted' }))
        .catch(() => {
          throw new BadRequestException('Can not accept feat request');
        });

    return await this.removeFeatRequest(requestId)
      .then(() => ({ id: requestId, msg: 'Feat request accepted' }))
      .catch(() => {
        this.logger.error(`Can not accept feat with ID "${requestId}"`);
        throw new NotFoundException(
          `Can not accept feat with ID "${requestId}"`,
        );
      });
  }

  async refuseFeatRequest(userId: string, requestId: string) {
    this.logger.log(`Refusing request ${requestId}`);

    const featRequest = await this.findFeatRequestById(requestId);
    const trackRequests = await this.findFeatRequestByDestIdAndTrackId(
      userId,
      featRequest.track.toString(),
    );

    if (trackRequests.length === 0)
      return { id: requestId, msg: 'Feat request refused' };

    return await this.removeFeatRequest(requestId)
      .then(() => ({ id: requestId, msg: 'Feat request refused' }))
      .catch(() => {
        this.logger.error(`Can not refuse feat with ID "${requestId}"`);
        throw new NotFoundException(
          `Can not refuse feat with ID "${requestId}"`,
        );
      });
  }

  async removeFeatRequest(id: string) {
    this.logger.log(`Removing feat request ${id}`);
    if (id) {
      const featRequest = await this.featRequestModel.findById(id);
      await featRequest.remove().catch(() => {
        throw new BadRequestException(`Can't remove feat request ${id}`);
      });
      return featRequest._id;
    }
  }
}
