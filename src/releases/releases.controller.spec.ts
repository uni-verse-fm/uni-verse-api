import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';
import * as request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import * as data from '../test-utils/data/mock_data.json';
import { Release } from './schemas/release.schema';
import RepoMockModel, { data2list } from '../test-utils/mocks/standard-mock.service';
import { TracksService } from '../tracks/tracks.service';
import { Track } from '../tracks/schemas/track.schema';
import { FilesService } from '../files/files.service';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import TracksRepoMockModel from '../test-utils/mocks/Tracks-mock.service';

const release = data.releases.black_album
const releases = data2list(data.releases)

const release1 = data.releases.wtt;

const create_release = data.create_release.wtt;

const author = data.users.jayz;

describe('ReleasesController', () => {
    let app: INestApplication;
    
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReleasesController],
            providers: [
                ReleasesService,
                TracksService,
                FilesService,
                UsersService,
                {
                    provide: getModelToken(User.name),
                    useValue: new RepoMockModel(data.users, 4, 2),
                },
                {
                    provide: getModelToken(Release.name),
                    useValue: new RepoMockModel(data.releases),
                },
                {
                    provide: getModelToken(Track.name),
                    useValue: new TracksRepoMockModel(data.tracks),
                },
            ],
        }).overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (context: ExecutionContext) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = { id: "0" };
                    return true
                },
            })
            .compile();

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    describe('find all releases', () => {
        it('shoul return all releases', () => {
            return request(app.getHttpServer())
                .get('/releases')
                .expect(200)
                .expect(releases);
        })
    })

    describe('find on release by id', () => {
        it('shoul return one release', () => {
            return request(app.getHttpServer())
                .get(`/releases/${release._id}`)
                .expect(200)
                .expect(release);
        })
    })

    describe('create a release', () => {

        const files_data = create_release.tracks.map( track => Buffer.from(track.title))

        const expected = {
            title: release1.title,
            description: release1.description,
            coverUrl: release1.coverUrl,
            author: {
                id: author._id,
                username: author.username,
                email: author.email
            },
            feats: release1.feats.map(feat => ({
                id: feat._id,
                username: feat.username,
                email: feat.email
            }))
        };

        it('should return a release', async () => {

            return await request(app.getHttpServer())
                .post('/releases')
                .field("data", JSON.stringify(create_release))
                .attach('files', files_data[0], 'track_1')
                .attach('files', files_data[1], 'track_2')
                .attach('files', files_data[2], 'track_3')
                .expect(expected);
        });
    });

    describe('delete my release', () => {

        const expected = {
            id: release._id,
            title: release.title,
            msg: 'Release deleted',
        };

        it('should return the release', async () => {
            return await request(app.getHttpServer())
                .delete(`/releases/${release._id}`)
                .expect(expected);
        });
    });

    afterAll(done => {
        app.close();
        done();
    })
});
