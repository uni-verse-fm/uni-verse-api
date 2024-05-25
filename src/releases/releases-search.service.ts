/* Copyright (c) 2022 uni-verse corp */

import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ISearchService } from '../search/interfaces/search.service.interface';
import IReleaseSearchBody from './interfaces/release-search-body.interface';
import { ReleaseDocument } from './schemas/release.schema';

@Injectable()
export default class ReleasesSearchService
  implements ISearchService<ReleaseDocument> {
  index = 'release';
  private readonly logger: Logger = new Logger(ReleasesSearchService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) { }

  async insertIndex(release: ReleaseDocument): Promise<any> {
    this.logger.log(`Inserting user ID "${release._id}"`);
    return await this.elasticsearchService.index<IReleaseSearchBody>({
      index: this.index,
      body: {
        id: release._id.toString(),
        title: release.title,
      },
    });
  }
  async searchIndex(text: string): Promise<any[]> {
    this.logger.log(`Searching "${text}"`);

    const { hits } = await this.elasticsearchService.search<IReleaseSearchBody>(
      {
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
      },
    );
    return hits.hits.map((item) => item._source);
  }
  updateIndex(release: ReleaseDocument): Promise<any> {
    this.logger.log(`Searching "${release._id}"`);

    const newBody: IReleaseSearchBody = {
      id: release._id.toString(),
      title: release.title,
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
            id: release._id.toString(),
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
