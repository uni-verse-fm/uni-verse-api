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
import { ICreateTrackResponse } from './interfaces/track-create-response.interface';
import { FilesService } from '../files/files.service';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { IDeleteTrackResponse } from './interfaces/track-delete-response.interface copy';
import { FileMimeType } from '../files/dto/simple-create-file.dto';
import { BucketName } from '../minio-client/minio-client.service';
import { isValidId } from '../utils/is-valid-id';

@Injectable()
export class TracksService {
  private readonly logger: Logger = new Logger(TracksService.name);

  constructor(
    @InjectModel(Track.name)
    private trackModel: Model<TrackDocument>,
    private filesService: FilesService,
    private usersService: UsersService,
  ) {}

  async createTrack(
    createTrackDto: CreateTrackDto,
    session: ClientSession | null = null,
  ): Promise<ICreateTrackResponse> {
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

    return this.buildTrackInfo(createdTrack);
  }

  async createManyTracks(
    tracks: CreateTrackDto[],
    session: ClientSession | null = null,
  ): Promise<ICreateTrackResponse[]> {
    this.logger.log(`Creating ${tracks.length} tracks`);
    return await Promise.all(
      tracks.map((track) => this.createTrack(track, session)),
    );
  }

  async findAllTracks() {
    this.logger.log('Finding all tracks');
    return await this.trackModel.find();
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
    const track = await this.findTrackById(id);
    if (!track) {
      this.logger.error(`Track ${id} not found`);
      throw new NotFoundException('Somthing wrong with the server');
    }
    await track.remove(session);
    await this.filesService.removeFile(
        track.fileName,
        BucketName.Tracks,
      );
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
      tracks.map((track) => this.removeTrack(track.toString(), session)),
    );
  }

  private buildTrackInfo(track: any): ICreateTrackResponse {
    this.logger.log(`Building track info ${track.title}`);
    return {
      id: track._id,
      title: track.title,
      fileName: track.fileName,
      feats: track.feats.map((feat) => ({
        _id: feat._id,
        username: feat.username,
        email: feat.email,
      })),
      author: track.author,
    };
  }

  private async isTrackUnique(title: string) {
    this.logger.log(`Checking if track ${title} is unique`);
    const release = await this.trackModel.findOne({ title });
    if (release?.title === title) {
      throw new BadRequestException('Title must be unique.');
    }
  }
}
