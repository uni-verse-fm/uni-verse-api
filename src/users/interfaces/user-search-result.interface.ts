import IUserSearchBody from "./user-search-body.interface";

interface IUserSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: IUserSearchBody;
    }>;
  };
}

interface ISearchUserResponse {
    
}

export default IUserSearchResult;