/* Copyright (c) 2022 uni-verse corp */

import IUserSearchBody from './user-search-body.interface';

interface IUserSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: IUserSearchBody;
    }>;
  };
}

export default IUserSearchResult;
