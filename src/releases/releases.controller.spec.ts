import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';
import * as request from 'supertest';
import { mockReleases } from '../test-utils/data/data-test';
import { getModelToken } from '@nestjs/mongoose';
import { ReleaseRepoMockModel } from '../test-utils/mocks/users-mock.service';
import { Release } from './schemas/release.schema';

describe('ReleasesController', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReleasesController],
            providers: [
                ReleasesService,
                {
                    provide: getModelToken(Release.name),
                    useValue: ReleaseRepoMockModel,
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
                .expect(mockReleases);
        })
    })

    describe('find on release by id', () => {
        it('shoul return one release', () => {
            return request(app.getHttpServer())
                .get(`/releases/${mockReleases[0]._id}`)
                .expect(200)
                .expect(mockReleases[0]);
        })
    })

    afterAll(done => {
        app.close();
        done();
    })
});
