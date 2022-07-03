/* Copyright (c) 2022 uni-verse corp */

import IReleaseSearchBody from './release-search-body.interface';

interface IReleaseSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: IReleaseSearchBody;
    }>;
  };
}

export default IReleaseSearchResult;
