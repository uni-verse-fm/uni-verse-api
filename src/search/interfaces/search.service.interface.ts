export interface ISearchService<T> {
  insertIndex(user: T): Promise<any>;

  searchIndex(text: string): Promise<any[]>;

  updateIndex(data: T): Promise<any>;

  deleteIndex(id: string): void;
}
