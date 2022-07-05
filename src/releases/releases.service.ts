/* Copyright (c) 2022 uni-verse corp */

import {
  BadRequestException,
  Injectable,
  Logger,
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
import { isValidId } from '../utils/is-valid-id';
import { buildSimpleFile } from '../utils/buildSimpleFile';
import { FilesService } from '../files/files.service';
import { BucketName } from '../minio-client/minio-client.service';
import { ITrackResponse } from '../tracks/interfaces/track-response.interface';
import ReleasesSearchService from './releases-search.service';
import * as mongoose from 'mongoose';

@Injectable()
export class ReleasesService {
  private readonly logger: Logger = new Logger(ReleasesService.name);

  constructor(
    @InjectModel(Release.name)
    private releaseModel: Model<ReleaseDocument>,
    private tracksService: TracksService,
    private usersService: UsersService,
    @InjectConnection()
    private connection: Connection,
    private filesService: FilesService,
    private releasesSearchService: ReleasesSearchService,
  ) {}

  async createRelease(
    files: SimpleCreateFileDto[],
    cover: SimpleCreateFileDto,
    createRelease: CreateReleaseDto,
    author: UserDocument,
  ) {
    this.logger.log(`Creating release`);

    await this.isReleaseUnique(createRelease.title);

    const feats: UserDocument[] = createRelease.feats
      ? await this.usersService.findManyUsersByIds(
          createRelease.feats.map((feat) => feat.id),
        )
      : [];

    const orderedTracks = this.orderedTracks(files, createRelease);

    const session = await this.connection.startSession();
    try {
      let release;
      const createResponse = await session
        .withTransaction(async () => {
          const tracks: ITrackResponse[] =
            await this.tracksService.createManyTracks(
              createRelease.tracks.map((track) => ({
                ...track,
                author,
                file: buildSimpleFile(orderedTracks, track.originalFileName),
              })),
            );

          const coverName: string = await this.filesService.createFile(
            cover,
            BucketName.Images,
          );
          const createdRelease = {
            ...createRelease,
            author,
            feats: feats.map((feat) => feat._id),
            tracks: tracks.map((track) => track.id),
            coverName,
          };

          release = await this.releaseModel.create(createdRelease);
          await this.releasesSearchService.insertIndex(release);
        })
        .then(() => this.buildReleaseInfo(release, feats));
      return createResponse;
    } catch (error) {
      this.logger.error(
        `Can't create release "${createRelease.title}" due to: ${error}`,
      );
    } finally {
      session.endSession();
    }
  }

  private orderedTracks(
    files: SimpleCreateFileDto[],
    createRelease: CreateReleaseDto,
  ): Map<string, SimpleCreateFileDto> {
    this.logger.log(`Orderedering tracks`);
    const releaseFilesNames: string[] = createRelease.tracks.map(
      (track) => track.originalFileName,
    );
    const filesFilesNames: string[] = files.map(
      (file) => file.originalFileName,
    );
    const fileNamesToFiles: Map<string, SimpleCreateFileDto> = new Map(
      files.map((file) => [file.originalFileName, file]),
    );

    const nameToBuffer: Map<string, SimpleCreateFileDto> = new Map<
      string,
      SimpleCreateFileDto
    >();

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
          this.logger.error(`Release file "${releaseFileName}" not found`),
          `File with track name "${releaseFileName}" doesn't exist`,
        );
      });

      return nameToBuffer;
    }
    throw new BadRequestException(
      this.logger.error(`Release files count doesn't match`),
      'The number of tracks the number of files should be the same.',
    );
  }

  async find(title: string): Promise<ReleaseDocument[] | ReleaseDocument> {
    this.logger.log(`Finding release "${title}"`);
    if (title) return await this.findReleaseByTitle(title);
    return await this.findAllReleases();
  }

  async findAllReleases(): Promise<ReleaseDocument[]> {
    this.logger.log(`Finding all releases`);
    return await this.releaseModel.find();
  }

  async findReleaseById(id: string): Promise<ReleaseDocument> {
    this.logger.log(`Finding release by id "${id}"`);
    isValidId(id);
    const release = await this.releaseModel
      .findById(id)
      .populate('tracks')
      .populate({
        path: 'tracks',
        populate: {
          path: 'author',
        },
      })
      .populate('feats')
      .populate('author');
    if (!release) {
      throw new BadRequestException(`Release with ID "${id}" not found.`);
    }
    return release;
  }

  async findReleaseByTitle(title: string): Promise<ReleaseDocument> {
    this.logger.log(`Finding release by title "${title}"`);
    const release = await this.releaseModel.findOne({ title });
    if (!release) {
      throw new BadRequestException(`Release with title ${title} not found.`);
    }
    return release;
  }

  async removeRelease(id: string, owner: UserDocument) {
    this.logger.log(`Removing release "${id}"`);
    isValidId(id);
    const release = await this.isUserTheOwnerOfRelease(id, owner);

    const session = await this.connection.startSession();

    try {
      const deleteResponse = await session
        .withTransaction(async () => {
          await this.tracksService.removeManyTracks(release.tracks, session);
          await this.filesService.removeFile(
            release.coverName,
            BucketName.Images,
          );
          await release.remove();
        })
        .then(() => ({
          id: release._id.toString(),
          title: release.title,
          msg: 'Release deleted',
        }));
      this.releasesSearchService.deleteIndex(id);

      return deleteResponse;
    } catch (error) {
      this.logger.error(`Can't remove release "${id}" due to: ${error}`);
    } finally {
      session.endSession();
    }
  }

  private buildReleaseInfo(
    release: Release,
    feats: UserDocument[],
  ): IReleaseResponse {
    this.logger.log(`Building release info`);
    return {
      title: release.title,
      description: release.description,
      coverName: release.coverName,
      feats: feats.map((feat) => ({
        id: feat._id.toString(),
        username: feat.username,
        email: feat.email,
        profilePicture: feat.profilePicture,
      })),
      author: {
        id: release.author._id.toString(),
        username: release.author.username,
        email: release.author.email,
        profilePicture: release.author.profilePicture,
      },
    };
  }

  private async isUserTheOwnerOfRelease(id: string, owner: UserDocument) {
    this.logger.log(`Checking if user is the owner of release "${id}"`);
    isValidId(id);
    const release = await this.findReleaseById(id);
    if (!release) {
      this.logger.error(`Release "${id}" not found`);
      throw new NotFoundException('Somthing wrong with the server');
    }
    if (release.author._id.toString() !== owner._id.toString()) {
      this.logger.error(
        `User "${owner.username}" is not the owner of release "${id}"`,
      );
      throw new BadRequestException('You are not the owner of this release.');
    }
    return release;
  }

  async releasesByUserId(userId: string) {
    this.logger.log(`Finding releases by user id "${userId}"`);
    return await this.releaseModel
      .aggregate([
        {
          $match: { author: new mongoose.Types.ObjectId(userId) },
        },
        {
          $lookup: {
            from: 'tracks',
            localField: 'tracks',
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
                  from: 'views',
                  localField: '_id',
                  foreignField: 'track',
                  as: 'viewsDocs',
                },
              },
              {
                $project: {
                  id: '$_id',
                  title: '$title',
                  fileName: '$fileName',
                  feats: '$feats',
                  author: '$author',
                  views: { $size: '$viewsDocs' },
                },
              },
            ],
            as: 'tracks',
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { user_id: '$author' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$$user_id', '$_id'],
                  },
                },
              },
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
          $project: {
            id: 1,
            title: 1,
            coverName: 1,
            feats: {
              id: 1,
              username: 1,
              email: 1,
            },
            tracks: 1,
            author: { $arrayElemAt: ['$author', 0] },
            createdAt: 1,
          },
        },
      ])
      .catch(() => {
        throw new Error('Somthing went wrong');
      });
  }

  async searchRelease(search: string) {
    const results = await this.releasesSearchService.searchIndex(search);
    const ids = results.map((result) => new mongoose.Types.ObjectId(result.id));
    if (!ids.length) {
      return [];
    }
    return await this.releaseModel
      .aggregate([
        {
          $match: {
            _id: {
              $in: ids,
            },
          },
        },
        {
          $lookup: {
            from: 'tracks',
            localField: 'tracks',
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
                  from: 'views',
                  localField: '_id',
                  foreignField: 'track',
                  as: 'viewsDocs',
                },
              },
              {
                $project: {
                  id: '$_id',
                  title: '$title',
                  fileName: '$fileName',
                  feats: '$feats',
                  author: '$author',
                  views: { $size: '$viewsDocs' },
                },
              },
            ],
            as: 'tracks',
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { user_id: '$author' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$$user_id', '$_id'],
                  },
                },
              },
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
          $project: {
            id: 1,
            title: 1,
            coverName: 1,
            feats: {
              id: 1,
              username: 1,
              email: 1,
            },
            tracks: 1,
            author: { $arrayElemAt: ['$author', 0] },
            createdAt: 1,
          },
        },
      ])
      .catch((error) => {
        throw new Error('Somthing went wrong ' + error);
      });
  }

  private async isReleaseUnique(title: string) {
    this.logger.log(`Checking if release "${title}" is unique`);
    const release = await this.releaseModel
      .findOne({ title })
      .catch(() => this.logger.error(`Failed to find release ${title}`));
    if (release) {
      this.logger.error('Release must be unique.');
      throw new BadRequestException('Release must be unique.');
    }
  }
}
