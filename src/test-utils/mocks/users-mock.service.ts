import { mockCreateResponse, mockUsers } from "../data/data-test";

export const userRepoMockModel = {
    find: jest.fn().mockReturnValue(mockUsers),
    findOne: jest.fn().mockReturnValue(mockUsers[0]),
    findById: jest.fn().mockReturnValue(mockUsers[0]),
    deleteOne: jest.fn().mockReturnValue(mockUsers[0]),
    create: jest.fn().mockResolvedValue(mockCreateResponse),
    save: jest.fn().mockReturnValue(Promise.resolve()),
}