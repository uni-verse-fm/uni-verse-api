import IPacksSearchBody from './packs-search-body.interface';

interface IPacksSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: IPacksSearchBody;
    }>;
  };
}

export default IPacksSearchResult;
