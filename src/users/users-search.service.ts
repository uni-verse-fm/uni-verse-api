/* Copyright (c) 2022 uni-verse corp */

import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ISearchService } from '../search/interfaces/search.service.interface';
import IUserSearchBody from './interfaces/user-search-body.interface';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export default class UsersSearchService
  implements ISearchService<UserDocument>
{
  index = 'user';
  private readonly logger: Logger = new Logger(UsersSearchService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async insertIndex(user: User | UserDocument) {
    this.logger.log(`Inserting user ID "${user._id}"`);
    return await this.elasticsearchService.index<IUserSearchBody>({
      index: this.index,
      body: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  }

  async searchIndex(text: string) {
    this.logger.log(`Searching "${text}"`);

    const { hits } = await this.elasticsearchService.search<IUserSearchBody>({
      index: this.index,
      body: {
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: text,
                  fields: ['username', 'email'],
                  fuzziness: 'AUTO',
                },
              },
              {
                multi_match: {
                  query: text,
                  fields: ['username', 'email'],
                  type: 'phrase_prefix',
                },
              },
            ],
          },
        },
      },
    });
    return hits.hits.map((item) => item._source);
  }

  updateIndex(user: UserDocument) {
    this.logger.log(`Searching "${user._id}"`);

    const newBody: IUserSearchBody = {
      id: user._id,
      username: user.username,
      email: user.email,
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
            id: user._id,
          },
        },
        script: script,
      },
    });
  }

  async existIndex(email: string) {
    this.logger.log(`Verifying if user "${email}" index exists`);
    return await this.elasticsearchService.search<IUserSearchBody>({
      index: this.index,
      body: {
        query: {
          term: {
            email: email,
          },
        },
      },
    });
  }

  deleteIndex(id: string) {
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
