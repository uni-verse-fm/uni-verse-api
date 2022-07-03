/* Copyright (c) 2022 uni-verse corp */

import IPlaylistSearchBody from '../../releases/interfaces/release-search-body.interface';

interface IPlaylistSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: IPlaylistSearchBody;
    }>;
  };
}

export default IPlaylistSearchResult;
