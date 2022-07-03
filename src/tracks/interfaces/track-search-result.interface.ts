/* Copyright (c) 2022 uni-verse corp */

import ITrackSearchBody from '../../users/interfaces/user-search-body.interface';

interface ITrackSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: ITrackSearchBody;
    }>;
  };
}

export default ITrackSearchResult;
