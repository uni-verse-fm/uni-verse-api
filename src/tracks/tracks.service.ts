/* Copyright (c) 2022 uni-verse corp */

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateTrackDto } from './dto/create-track.dto';
import { Track, TrackDocument } from './schemas/track.schema';
import { Model, ClientSession } from 'mongoose';
import { ITrackResponse } from './interfaces/track-response.interface';
import { FilesService } from '../files/files.service';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { IDeleteTrackResponse } from './interfaces/track-delete-response.interface copy';
import { BucketName } from '../minio-client/minio-client.service';
import { isValidId } from '../utils/is-valid-id';
import TracksSearchService from './tracks-search.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import * as mongoose from 'mongoose';

@Injectable()
export class TracksService {
  private readonly logger: Logger = new Logger(TracksService.name);

  constructor(
    @InjectModel(Track.name)
    private trackModel: Model<TrackDocument>,
    private filesService: FilesService,
    private usersService: UsersService,
    private tracksSearchService: TracksSearchService,
    private amqpConnection: AmqpConnection,
  ) {}

  async createTrack(
    createTrackDto: CreateTrackDto,
    session: ClientSession | null = null,
  ): Promise<ITrackResponse> {
    this.logger.log(`Creating track ${createTrackDto.title}`);
    const feats: UserDocument[] = [];

    const result: string = await this.filesService.createFile(
      createTrackDto.file,
      BucketName.Tracks,
    );

    if (createTrackDto.feats) {
      for (const feat of createTrackDto.feats) {
        const user = await this.usersService.findUserByUsername(feat.username);
        feats.push(user);
      }
    }

    const createTrack = {
      ...createTrackDto,
      feats,
      fileName: result,
    };

    const newTrack = new this.trackModel(createTrack);

    const createdTrack = await newTrack.save({ session });
    this.tracksSearchService.insertIndex(createdTrack);

    this.NotifyFpWorker(result);
    this.NotifyPlagiaWorker(createdTrack._id, result);

    return this.buildTrackInfo(createdTrack);
  }

  async createManyTracks(
    tracks: CreateTrackDto[],
    session: ClientSession | null = null,
  ): Promise<ITrackResponse[]> {
    this.logger.log(`Creating ${tracks.length} tracks`);
    return await Promise.all(
      tracks.map((track) => this.createTrack(track, session)),
    );
  }

  private NotifyFpWorker(track_url: string) {
    // gotta wait for file to be available
    setTimeout(() => {
      this.amqpConnection.publish(
        'uni-verse-fp-in',
        'universe.fp.in.routing.key',
        {
          track_url,
        },
      );
    }, 2000);
  }

  private NotifyPlagiaWorker(id: string, track_url: string) {
    setTimeout(() => {
      this.amqpConnection.publish(
        'uni-verse-plagia-in',
        'universe.plagia.in.routing.key',
        {
          track_url,
          id,
        },
      );
    }, 2000);
  }

  async plagiateTrack(id: string) {
    this.logger.log('Plagiate track');
    return await this.trackModel.updateOne({ _id: id }, { isPlagia: true });
  }

  async findAllTracks() {
    this.logger.log('Finding all tracks');
    return await this.trackModel.find();
  }

  async findTrackByIdExternal(id: string): Promise<ITrackResponse> {
    this.logger.log(`Finding track by id ${id}`);
    isValidId(id);
    const track = await this.trackModel
      .findById(id)
      .populate('author')
      .populate('feats');
    if (!track) {
      throw new BadRequestException(`Track with ID "${id}" doesn't exist`);
    }
    return this.buildTrackInfo(track);
  }

  async findTrackById(id: string): Promise<TrackDocument> {
    this.logger.log(`Finding track by id ${id}`);
    isValidId(id);
    const track = await this.trackModel.findById(id);
    if (!track) {
      throw new BadRequestException(`Track with ID "${id}" doesn't exist`);
    }
    return track;
  }

  async findTracksByUserId(id: string): Promise<TrackDocument[]> {
    this.logger.log(`Finding track by id ${id}`);
    isValidId(id);
    return await this.trackModel.find({ author: id }).catch(() => {
      throw new BadRequestException(
        `Tracks for user with ID "${id}" doesn't exist`,
      );
    });
  }

  async findTrackByFilename(fileName: string): Promise<TrackDocument> {
    this.logger.log(`Finding track by filename ${fileName}`);
    const track = await this.trackModel.findOne({ fileName });
    if (!track) {
      throw new BadRequestException(
        `Track with filename "${fileName}" doesn't exist.`,
      );
    }

    return track;
  }

  async findTrackByTitle(title: string): Promise<TrackDocument> {
    this.logger.log(`Finding track by title ${title}`);
    const track = await this.trackModel.findOne({ title });
    if (!track) {
      throw new BadRequestException(
        `Resource with title "${title}" doesn't exist`,
      );
    }
    return track;
  }

  async removeTrack(
    id: string,
    session: ClientSession | null = null,
  ): Promise<IDeleteTrackResponse> {
    this.logger.log(`Removing track ${id}`);
    const track = await this.trackModel.findById(id);
    if (!track) {
      this.logger.error(`Track ${id} not found`);
      throw new NotFoundException('Somthing wrong with the server');
    }
    await track.remove(session);
    await this.filesService.removeFile(track.fileName, BucketName.Tracks);
    this.tracksSearchService.deleteIndex(id);
    return {
      id: track._id,
      title: track.title,
      msg: 'Track deleted',
    };
  }

  async removeManyTracks(
    tracks: Track[],
    session: ClientSession | null = null,
  ): Promise<IDeleteTrackResponse[]> {
    this.logger.log(`Removing ${tracks.length} tracks`);
    return await Promise.all(
      tracks.map((track) => this.removeTrack(track._id.toString(), session)),
    );
  }

  private buildTrackInfo(track: TrackDocument): ITrackResponse {
    this.logger.log(`Building track info ${track.title}`);
    return {
      id: track._id,
      title: track.title,
      fileName: track.fileName,
      isPlagia: track.isPlagia,
      feats: track.feats.map((feat) => ({
        id: feat._id.toString(),
        username: feat.username,
        email: feat.email,
        profilePicture: feat.profilePicture,
      })),
      author: {
        id: track.author._id.toString(),
        username: track.author.username,
        email: track.author.email,
        profilePicture: track.author.profilePicture,
      },
    };
  }

  private async isTrackUnique(title: string) {
    this.logger.log(`Checking if track ${title} is unique`);
    const release = await this.trackModel.findOne({ title });
    if (release?.title === title) {
      throw new BadRequestException('Title must be unique.');
    }
  }

  async searchTrack(search: string): Promise<TrackDocument[]> {
    this.logger.log(`Searching for track`);

    const results = await this.tracksSearchService.searchIndex(search);
    const ids = results.map((result) => new mongoose.Types.ObjectId(result.id));
    if (!ids.length) {
      return [];
    }
    return this.trackModel.aggregate([
      {
        $match: {
          _id: {
            $in: ids,
          },
        },
      },
      {
        $lookup: {
          from: 'views',
          localField: '_id',
          foreignField: 'track',
          as: 'viewsDocs',
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
          title: 1,
          fileName: 1,
          feats: {
            id: '$_id',
            username: 1,
            email: 1,
          },
          isPlagia: 1,
          views: { $size: '$viewsDocs' },
          release: { $arrayElemAt: ['$release', 0] },
          author: { $arrayElemAt: ['$author', 0] },
        },
      },
    ]);
  }
}
