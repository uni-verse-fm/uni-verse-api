import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateTrackDto } from './dto/create-track.dto';
import { Track, TrackDocument } from './schemas/track.schema';
import { Model, ClientSession } from 'mongoose';
import { ICreateTrackResponse } from './interfaces/track-create-response.interface';
import { FilesService } from '../files/files.service';
import IFileResponse from '../files/interfaces/file-response.interface';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { IDeleteTrackResponse } from './interfaces/track-delete-response.interface copy';
import { FileMimeType } from '../files/dto/simple-create-file.dto';
import { BucketName } from '../minio-client/minio-client.service';

@Injectable()
export class TracksService {
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
    // this.isTrackUnique(createTrackDto.title);

    const feats: UserDocument[] = [];

    const file = {
      originalFileName: createTrackDto.originalFileName,
      buffer: createTrackDto.buffer,
      size: 4000,
      mimetype: FileMimeType.MPEG,
    };
    const result: string = await this.filesService.createFile(
      file,
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
    return await Promise.all(
      tracks.map((track) => this.createTrack(track, session)),
    );
  }

  async findAllTracks() {
    return await this.trackModel.find();
  }

  async findTrackById(id: string): Promise<TrackDocument> {
    const track = await this.trackModel.findById(id);
    if (!track) {
      throw new BadRequestException(`Track with ID "${id}" doesn't exist`);
    }
    return track;
  }

  async findTrackByTitle(title: string): Promise<TrackDocument> {
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
    const track = await this.findTrackById(id);
    if (!track) {
      throw new NotFoundException('Somthing wrong with the server');
    }
    await this.trackModel.deleteOne({ id: track._id }, session);
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
    return await Promise.all(
      tracks.map((track) => this.removeTrack(track.toString(), session)),
    );
  }

  private buildTrackInfo(track: any): ICreateTrackResponse {
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
    const release = await this.trackModel.findOne({ title });
    if (release?.title === title) {
      throw new BadRequestException('Title must be unique.');
    }
  }
}
