import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as mongoose from 'mongoose';
import { mockReleases, mockUsers } from '../test-utils/data/data-test';
import { ReleaseRepoMockModel, UserRepoMockModel } from '../test-utils/mocks/users-mock.service';
import { User } from '../users/schemas/user.schema';
import { ReleasesService } from './releases.service';
import { Release } from './schemas/release.schema';

describe('ReleasesService', () => {
    let releasesService: ReleasesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReleasesService,
                {
                    provide: getModelToken(Release.name),
                    useValue: ReleaseRepoMockModel,
                },
                {
                    provide: getModelToken(User.name),
                    useValue: UserRepoMockModel,
                },
            ],
        }).compile();

        releasesService = module.get<ReleasesService>(ReleasesService);
    });

    describe('When create one release', () => {

        const user: User = {
            ...mockUsers[0],
            _id: new mongoose.Schema.Types.ObjectId(mockUsers[0]._id),
            releases: []
        }

        const body = {
            title: mockReleases[0].title,
            description: mockReleases[0].description,
            coverUrl: mockReleases[0].coverUrl,
        };

        const expected = {
            title: mockReleases[0].title,
            description: mockReleases[0].description,
            coverUrl: mockReleases[0].coverUrl,
            author: {
                id: mockReleases[0].author._id,
                username: mockReleases[0].author.username,
                email: mockReleases[0].author.email,
            }
        };
        it('should return one release infos', async () => {
            const release = await releasesService.create(body, user)
            expect(release).toStrictEqual(expected);
        });
    })

    describe('When find all rleases', () => {
        it('should return a list of releases', async () => {
            const releases = await releasesService.findAll()
            expect(releases).toStrictEqual(mockReleases);
        });
    })

    describe('When find one release by id', () => {
        it('should return one release', async () => {
            const release = await releasesService.findOne(mockReleases[0]._id)
            expect(release).toStrictEqual(mockReleases[0]);
        });
    })

    describe('When find one release by title', () => {
        it('should return one release', async () => {
            const release = await releasesService.findByTitle(mockReleases[0].title)
            expect(release).toStrictEqual(mockReleases[0]);
        });
    })

    describe('When remove one release', () => {

        const expected = {
            id: mockReleases[0]._id,
            title: mockReleases[0].title,
            msg: 'Release deleted',
        };
        it('should return one release infos', async () => {
            const release = await releasesService.remove(mockReleases[0]._id)
            expect(release).toStrictEqual(expected);
        });
    })
});
