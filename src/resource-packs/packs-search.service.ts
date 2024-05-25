/* Copyright (c) 2022 uni-verse corp */

import { ResourcePackDocument } from './schemas/resource-pack.schema';
import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ISearchService } from '../search/interfaces/search.service.interface';
import IPacksSearchBody from './interfaces/packs-search-body.interface';

@Injectable()
export default class PacksSearchService
  implements ISearchService<ResourcePackDocument> {
  index = 'resource-packs';
  private readonly logger: Logger = new Logger(PacksSearchService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) { }

  async insertIndex(resourcePack: ResourcePackDocument): Promise<any> {
    this.logger.log(`Inserting user ID "${resourcePack._id}"`);
    return await this.elasticsearchService.index<IPacksSearchBody>({
      index: this.index,
      body: {
        id: resourcePack._id.toString(),
        title: resourcePack.title,
      },
    });
  }
  async searchIndex(text: string): Promise<any[]> {
    this.logger.log(`Searching "${text}"`);

    const { hits } = await this.elasticsearchService.search<IPacksSearchBody>({
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
  updateIndex(resourcePack: ResourcePackDocument): Promise<any> {
    this.logger.log(`Searching "${resourcePack._id}"`);

    const newBody: IPacksSearchBody = {
      id: resourcePack._id.toString(),
      title: resourcePack.title,
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
            id: resourcePack._id.toString(),
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
