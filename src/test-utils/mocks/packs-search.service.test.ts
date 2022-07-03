/* Copyright (c) 2022 uni-verse corp */

import { data2list } from './standard-mock.service.test';
import * as data from '../data/mock_data.json';
import PacksSearchService from '../../resource-packs/packs-search.service';

const resourcePack = data.resource_packs.resource_pack1;
const resource_packs = data2list(data.resource_packs).map((resourcePack) => ({
  id: resourcePack._id,
  title: resourcePack.title,
}));

const findByTitleExpected = {
  id: resourcePack._id,
  title: resourcePack.title,
};
const delete_expected = {
  title: resourcePack.title,
};

export const PacksSearchServiceMock = {
  provide: PacksSearchService,
  useValue: {
    insertIndex: jest.fn(() => {
      return {
        ...resourcePack,
      };
    }),
    searchIndex: jest.fn((title: string) => {
      return title ? findByTitleExpected : resource_packs;
    }),
    updateIndex: jest.fn(() => {
      return {};
    }),
    deleteIndex: jest.fn(() => {
      return {
        ...delete_expected,
      };
    }),
  },
};
