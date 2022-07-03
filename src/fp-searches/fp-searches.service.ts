/* Copyright (c) 2022 uni-verse corp */

import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { FpSearch, FpSearchDocument } from './schemas/fp-search.schema';
import { Model, Connection } from 'mongoose';
import { FilesService } from 'src/files/files.service';
import { SimpleCreateFileDto } from 'src/files/dto/simple-create-file.dto';
import { UserDocument } from 'src/users/schemas/user.schema';
import { BucketName } from 'src/minio-client/minio-client.service';
import { IFpSearchResponse } from './interfaces/fp-search-response.interface';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { isValidId } from 'src/utils/is-valid-id';
import { UpdateFpSearchDto } from './dto/update-fp-search.dto';
import { TracksService } from 'src/tracks/tracks.service';

@Injectable()
export class FpSearchesService {
  private readonly logger: Logger = new Logger(FpSearchesService.name);

  constructor(
    @InjectModel(FpSearch.name)
    private fpSearchModel: Model<FpSearchDocument>,
    @InjectConnection()
    private connection: Connection,
    private fileservice: FilesService,
    private readonly amqpConnection: AmqpConnection,
    private readonly trackService: TracksService,
  ) {}

  async createFpSearch(file: SimpleCreateFileDto, author?: UserDocument) {
    this.logger.log('Initiating fingerprint search.');

    const session = await this.connection.startSession();
    try {
      let fpSearch: FpSearchDocument;
      const createdResponse = await session
        .withTransaction(async () => {
          const filename = await this.fileservice.createFile(
            file,
            BucketName.Extracts,
          );

          const createdFpSearch = {
            filename,
            author,
          };

          fpSearch = await this.fpSearchModel.create(createdFpSearch);
        })
        .then(() => this.buildSearchInfo(fpSearch))
        .finally(() =>
          setTimeout(
            () =>
              this.NotifyFpWorker(fpSearch.filename, fpSearch._id.toString()),
            2000,
          ),
        );

      return createdResponse;
    } catch (error) {
      this.logger.error(`Can't do fingerprint search due to : ${error}`);
    } finally {
      session.endSession();
    }
  }

  async updateFpSearch(id: string, _updateSearchDto: UpdateFpSearchDto) {
    this.logger.log(`Updating search ${id}`);
    isValidId(id);
    const search = await this.fpSearchModel.findById(id);
    const track = await this.trackService.findTrackByFilename(
      _updateSearchDto.foundTrackFileName,
    );
    // secure in case the user is identified ?

    return await this.fpSearchModel
      .updateOne(
        {
          _id: search._id.toString(),
        },
        {
          foundTrack: track,
          takenTime: _updateSearchDto.takenTime,
        },
      )
      .then(() => ({
        id: search._id.toString(),
        msg: 'Search updated',
      }));
  }

  private NotifyFpWorker(extractUrl: string, searchId: string) {
    this.amqpConnection.publish(
      'uni-verse-fp-search',
      'universe.fp.search.routing.key',
      {
        extract_url: extractUrl,
        search_id: searchId,
      },
    );
  }

  private buildSearchInfo(fpSearch: FpSearch): IFpSearchResponse {
    this.logger.log(`Building search infos`);
    return {
      filename: fpSearch.filename,
      takenTime: fpSearch.takenTime,
      foundTrack: fpSearch.foundTrack
        ? {
            id: fpSearch.foundTrack._id,
            title: fpSearch.foundTrack.title,
            fileName: fpSearch.foundTrack.fileName,
            feats: fpSearch.foundTrack.feats.map((feat) => ({
              id: feat._id.toString(),
              username: feat.username,
              email: feat.email,
              profilePicture: feat.profilePicture,
            })),
            author: {
              id: fpSearch.foundTrack.author._id.toString(),
              username: fpSearch.foundTrack.author.username,
              email: fpSearch.foundTrack.author.email,
              profilePicture: fpSearch.foundTrack.author.profilePicture,
            },
          }
        : undefined,
      author: fpSearch.author
        ? {
            id: fpSearch.author._id.toString(),
            username: fpSearch.author.username,
            email: fpSearch.author.email,
            profilePicture: fpSearch.author.profilePicture,
          }
        : undefined,
    };
  }
}
