/* Copyright (c) 2022 uni-verse corp */

export const data2list = (data: object) =>
  Object.entries(data).map((item) => item[1]);

export default class RepoMockModel {
  items: any[];
  model: any;

  constructor(
    private data: any,
    private simpleId?: number,
    private createId?: number,
  ) {
    this.items = data2list(data);
  }

  find = () => this.items || [];
  findOne = () => this.items[this.simpleId || 0];
  findById = () => this.items[this.simpleId || 0];
  deleteOne = () => this.items[this.simpleId || 0];
  create = () => this.items[this.createId || 1];
  save = () => this.items[this.createId || 1];
}
