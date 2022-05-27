import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import IPlaylistSearchBody from '../releases/interfaces/release-search-body.interface';
import { ISearchService } from '../search/interfaces/search.service.interface';
import { PlaylistDocument } from './schemas/playlist.schema';

@Injectable()
export default class PlaylistsSearchService
  implements ISearchService<PlaylistDocument>
{
  index = 'playlist';
  private readonly logger: Logger = new Logger(PlaylistsSearchService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async insertIndex(playlist: PlaylistDocument): Promise<any> {
    this.logger.log(`Inserting user ID "${playlist._id}"`);
    return await this.elasticsearchService.index<IPlaylistSearchBody>({
      index: this.index,
      body: {
        id: playlist._id,
        title: playlist.title,
      },
    });
  }
  async searchIndex(text: string): Promise<any[]> {
    this.logger.log(`Searching "${text}"`);

    const { hits } =
      await this.elasticsearchService.search<IPlaylistSearchBody>({
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
  updateIndex(playlist: PlaylistDocument): Promise<any> {
    this.logger.log(`Searching "${playlist._id}"`);

    const newBody: IPlaylistSearchBody = {
      id: playlist._id,
      title: playlist.title,
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
            id: playlist._id,
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
