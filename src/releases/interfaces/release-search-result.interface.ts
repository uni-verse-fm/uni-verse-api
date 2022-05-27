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
