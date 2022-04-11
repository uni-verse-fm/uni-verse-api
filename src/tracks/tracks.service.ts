import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { Track, TrackDocument } from './schemas/track.schema';
import { Model, ClientSession } from 'mongoose';
import { ITrackResponse } from './interfaces/track-response.interface';
import { FilesService } from '../files/files.service';
import IFileResponse from '../files/interfaces/file-response.interface';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';

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
  ): Promise<ITrackResponse> {
    this.isTrackUnique(createTrackDto.title);

    const feats: UserDocument[] = [];

    const file = {
      fileName: createTrackDto.trackFileName,
      buffer: createTrackDto.buffer,
    };
    const result: IFileResponse = this.filesService.create(file);

    if (createTrackDto.feats) {
      for (const feat of createTrackDto.feats) {
        const user = await this.usersService.findUserByUsername(feat.username);
        feats.push(user);
      }
    }

    const createTrack = {
      ...createTrackDto,
      feats,
      trackFileUrl: result.fileUrl,
    };

    const newTrack = new this.trackModel(createTrack);

    const createdTrack = await newTrack.save({ session });

    return this.buildTrackInfo(createdTrack);
  }

  async createManyTracks(
    tracks: CreateTrackDto[],
    session: ClientSession | null = null,
  ): Promise<ITrackResponse[]> {
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

  updateTrack(id: string, updateTrackDto: UpdateTrackDto) {
    return `This action updates a #${id} track`;
  }

  async removeTrack(id: string) {
    const track = await this.findTrackById(id);
    if (!track) {
      throw new NotFoundException('Somthing wrong with the server');
    }
    await this.trackModel.deleteOne({ id: track._id });
    return {
      id: track._id,
      title: track.title,
      msg: 'Track deleted',
    };
  }

  // for testing
  private buildTrackInfo(track: any): ITrackResponse {
    return {
      _id: track._id,
      title: track.title,
      trackFileUrl: track.trackFileUrl,
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
