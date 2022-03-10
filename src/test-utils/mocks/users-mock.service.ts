import { mockCreateResponse, mockReleases, mockUsers } from '../data/data-test';


export class UserRepoMockModel {

    constructor(private data: any){}

    static find = jest.fn().mockReturnValue(mockUsers);
    static findOne = jest.fn().mockReturnValue(mockUsers[0]);
    static findById = jest.fn().mockReturnValue(mockUsers[0]);
    static deleteOne = jest.fn().mockReturnValue(mockUsers[0]);
    static create = jest.fn().mockResolvedValue(mockCreateResponse);
    save = jest.fn().mockReturnValue(Promise.resolve());
};

export class ReleaseRepoMockModel {

    constructor(private data: any){}

    static find = jest.fn().mockReturnValue(mockReleases);
    static findOne = jest.fn().mockReturnValue(mockReleases[0]);
    static findById = jest.fn().mockReturnValue(mockReleases[0]);
    static deleteOne = jest.fn().mockReturnValue(mockReleases[0]);
    static create = jest.fn().mockResolvedValue(mockReleases[2]);
    save = jest.fn().mockReturnValue(mockReleases[0]);
};
