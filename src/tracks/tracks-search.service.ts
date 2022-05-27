import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ISearchService } from '../search/interfaces/search.service.interface';
import ITrackSearchBody from './interfaces/track-search-body.interface';
import { TrackDocument } from './schemas/track.schema';

@Injectable()
export default class TracksSearchService
  implements ISearchService<TrackDocument>
{
  index = 'track';
  private readonly logger: Logger = new Logger(TracksSearchService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async insertIndex(track: TrackDocument): Promise<any> {
    this.logger.log(`Inserting user ID "${track._id}"`);
    return await this.elasticsearchService.index<ITrackSearchBody>({
      index: this.index,
      body: {
        id: track._id,
        title: track.title,
      },
    });
  }
  async searchIndex(text: string): Promise<any[]> {
    this.logger.log(`Searching "${text}"`);

    const { hits } = await this.elasticsearchService.search<ITrackSearchBody>({
      index: this.index,
      body: {
        query: {
          bool: {
            should: [
              {
                match: {
                  title: {
                    query: text,
                    fuzziness: 'AUTO',
                  },
                },
              },
              {
                match_phrase_prefix: {
                  title: {
                    query: text,
                  },
                },
              },
            ],
          },
        },
      },
    });
    return hits.hits.map((item) => item._source);
  }
  updateIndex(track: TrackDocument): Promise<any> {
    this.logger.log(`Searching "${track._id}"`);

    const newBody: ITrackSearchBody = {
      id: track._id,
      title: track.title,
    };

    const script: string = Object.entries(newBody).reduce(
      (result, [key, value]) => {
        return `${result} ctx._source.${key}='${value}';`;
      },
      '',
    );

    return this.elasticsearchService.updateByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: track._id,
          },
        },
        script: script,
      },
    });
  }
  deleteIndex(id: string): void {
    this.logger.log(`Deleting user "${id}" index `);
    this.elasticsearchService.deleteByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: id,
          },
        },
      },
    });
  }
}
