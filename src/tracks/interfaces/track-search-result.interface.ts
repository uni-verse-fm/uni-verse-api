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
