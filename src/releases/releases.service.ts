import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { CreateReleaseDto } from './dto/create-release.dto';
import { Release, ReleaseDocument } from './schemas/release.schema';
import { Model, Connection } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { IReleaseResponse } from './interfaces/release-response.interface';
import { SimpleCreateFileDto } from '../files/dto/simple-create-file.dto';
import { TracksService } from '../tracks/tracks.service';
import { UsersService } from '../users/users.service';
import { ICreateTrackResponse } from '../tracks/interfaces/track-create-response.interface';
import { UpdateReleaseDto } from './dto/update-release.dto';
import { isValidId } from '../utils/isValidId';

@Injectable()
export class ReleasesService {
  constructor(
    @InjectModel(Release.name)
    private releaseModel: Model<ReleaseDocument>,
    private tracksService: TracksService,
    private usersService: UsersService,
    @InjectConnection()
    private connection: Connection,
  ) {}

  async createRelease(
    files: SimpleCreateFileDto[],
    createRelease: CreateReleaseDto,
    author: UserDocument,
  ) {
    await this.isReleaseUnique(createRelease.title);

    const feats: UserDocument[] =
      await this.usersService.findManyUsersByUsernames(
        createRelease.feats.map((feat) => feat.username),
      );

    const session = await this.connection.startSession();

    const orderedTracks = this.orderedTracks(files, createRelease);

    session.startTransaction();
    try {
      const tracks: ICreateTrackResponse[] =
        await this.tracksService.createManyTracks(
          createRelease.tracks.map((track) => ({
            ...track,
            author,
            buffer: orderedTracks.get(track.originalFileName),
          })),
        );
      const createdRelease = {
        ...createRelease,
        author,
        feats: feats.map((feat) => feat._id),
        tracks: tracks.map((track) => track.id),
      };
      const release = await this.releaseModel.create(createdRelease);

      await session.commitTransaction();

      return this.buildReleaseInfo(release, feats);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private orderedTracks(
    files: SimpleCreateFileDto[],
    createRelease: CreateReleaseDto,
  ): Map<string, Buffer> {
    const releaseFilesNames: string[] = createRelease.tracks.map(
      (track) => track.originalFileName,
    );
    const filesFilesNames: string[] = files.map(
      (file) => file.originalFileName,
    );
    const fileNamesToFiles: Map<string, Buffer> = new Map(
      files.map((file) => [file.originalFileName, file.buffer]),
    );

    const nameToBuffer: Map<string, Buffer> = new Map<string, Buffer>();

    if (releaseFilesNames.length === filesFilesNames.length) {
      releaseFilesNames.every((releaseFileName) => {
        if (filesFilesNames.includes(releaseFileName)) {
          nameToBuffer.set(
            releaseFileName,
            fileNamesToFiles.get(releaseFileName),
          );
          return true;
        }
        throw new BadRequestException(
          `File with track name "${releaseFileName}" doesn't exist`,
        );
      });

      return nameToBuffer;
    }
    throw new BadRequestException(
      'The number of tracks the number of files should be the same.',
    );
  }

  async find(title: string): Promise<ReleaseDocument[] | ReleaseDocument> {
    if (title) return await this.findReleaseByTitle(title);
    return await this.findAllReleases();
  }

  async findAllReleases(): Promise<ReleaseDocument[]> {
    return await this.releaseModel.find();
  }

  async findReleaseById(id: string): Promise<ReleaseDocument> {
    isValidId(id);
    const release = await this.releaseModel.findById(id);
    if (!release) {
      throw new BadRequestException(`Release with ID "${id}" not found.`);
    }
    return release;
  }

  async findReleaseByTitle(title: string): Promise<ReleaseDocument> {
    const release = await this.releaseModel.findOne({ title });
    if (!release) {
      throw new NotFoundException(`Release with title ${title} not found.`);
    }
    return release;
  }

  async updateRelease(
    id: string,
    updateReleaseDto: UpdateReleaseDto,
    owner: UserDocument,
  ) {
    isValidId(id);
    return `This action updates a #${id} release`;
  }

  async removeRelease(id: string, owner: UserDocument) {
    isValidId(id);
    const release = await this.isUserTheOwnerOfRelease(id, owner);

    const session = await this.connection.startSession();

    session.startTransaction();
    try {
      await this.tracksService.removeManyTracks(release.tracks, session);
      await release.remove();
      return {
        id: release._id.toString(),
        title: release.title,
        msg: 'Release deleted',
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private buildReleaseInfo(
    release: Release,
    feats: UserDocument[],
  ): IReleaseResponse {
    return {
      title: release.title,
      description: release.description,
      coverUrl: release.coverUrl,
      feats: feats.map((feat) => ({
        id: feat._id.toString(),
        username: feat.username,
        email: feat.email,
      })),
      author: {
        id: release.author._id.toString(),
        username: release.author.username,
        email: release.author.email,
      },
    };
  }

  private async isUserTheOwnerOfRelease(id: string, owner: UserDocument) {
    isValidId(id);
    const release = await this.findReleaseById(id);
    if (!release) {
      throw new NotFoundException('Somthing wrong with the server');
    }
    if (release.author._id.toString() !== owner._id.toString()) {
      throw new BadRequestException('You are not the owner of this release.');
    }
    return release;
  }

  private async isReleaseUnique(title: string) {
    let release: ReleaseDocument;
    try {
      release = await this.releaseModel.findOne({ title });
    } catch (error) {
      throw new Error('Somthing went wrong.');
    }
    if (release?.title === title) {
      throw new BadRequestException('Release must be unique.');
    }
  }
}
