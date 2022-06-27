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
  ) {}

  async createFpSearch(file: SimpleCreateFileDto, author?: UserDocument) {
    this.logger.log('Initiating fingerprint search.');

    const session = await this.connection.startSession();
    try {
      let fpSearch;
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
        .then(() => this.buildSearchInfo(fpSearch));

      return createdResponse;
    } catch (error) {
      this.logger.error(`Can't do fingerprint search due to : ${error}`);
    } finally {
      session.endSession();
      this.NotifyFpWorker;
    }
  }

  private NotifyFpWorker(extract_url: string) {
    this.amqpConnection.publish(
      'uni-verse-fp-search',
      'universe.fp.search.routing.key',
      {
        extract_url,
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
