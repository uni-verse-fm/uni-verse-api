import {
  INestApplication,
  ExecutionContext,
  ValidationPipe,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilesService } from '../files/files.service';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../test-utils/in-memory/mongoose.helper.test';
import RepoMockModel, {
  data2list,
} from '../test-utils/mocks/standard-mock.service.test';
import TracksRepoMockModel from '../test-utils/mocks/Tracks-mock.service.test';
import * as request from 'supertest';
import * as data from '../test-utils/data/mock_data.json';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { ResourcePacksController } from './resource-packs.controller';
import { ResourcePacksService } from './resource-packs.service';
import { ResourcesService } from '../resources/resources.service';
import { ResourcePack } from './schemas/resource-pack.schema';
import { Resource } from '../resources/schemas/resource.schema';
import { PaymentsService } from '../payments/payments.service';
import { UserSearchServiceMock } from '../test-utils/mocks/users-search.service.test';
import { MinioServiceMock } from '../test-utils/mocks/minio.service.test';

const resource_pack = data.resource_packs.resource_pack1;
const resource_packs = data2list(data.resource_packs);

const create_resource_pack = data.create_resource_packs.resource_pack1;

const author = data.users.jayz;

const create_expected = {
  title: resource_pack.title,
  description: resource_pack.description,
  coverUrl: resource_pack.coverUrl,
  author: {
    id: author._id,
    username: author.username,
    email: author.email,
  },
};

const delete_expected = {
  id: resource_pack._id,
  title: resource_pack.title,
  msg: 'Resource pack deleted',
};
describe('ResourcePacksController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule()],
      controllers: [ResourcePacksController],
      providers: [
        ResourcesService,
        FilesService,
        UsersService,
        {
          provide: ResourcePacksService,
          useValue: {
            createResourcePack: jest.fn(() => {
              return {
                ...create_expected,
              };
            }),
            findAllResourcePacks: jest.fn(() => {
              return resource_packs;
            }),
            findResourcePackById: jest.fn(() => {
              return {
                ...resource_pack,
              };
            }),
            updateResourcePack: jest.fn(() => {
              return {};
            }),
            removeResourcePack: jest.fn(() => {
              return {
                ...delete_expected,
              };
            }),
            find: jest.fn(() => {
              return resource_packs;
            }),
          },
        },
        MinioServiceMock,
        {
          provide: PaymentsService,
          useValue: {
            createCustomer: jest.fn(() => {
              return { id: 1 };
            }),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: new RepoMockModel(data.users, 4, 2),
        },
        {
          provide: getModelToken(Resource.name),
          useValue: new RepoMockModel(data.resources),
        },
        {
          provide: getModelToken(ResourcePack.name),
          useValue: new TracksRepoMockModel(data.resource_packs),
        },
        UserSearchServiceMock
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: '0' };
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('find all resource packs', () => {
    it('shoul return all resource packs', () => {
      return request(app.getHttpServer())
        .get('/resource-packs')
        .expect(200)
        .expect(resource_packs);
    });
  });

  describe('find one resource pack by id', () => {
    it('shoul return one resource pack', () => {
      return request(app.getHttpServer())
        .get(`/resource-packs/${resource_pack._id}`)
        .expect(200)
        .expect(resource_pack);
    });
  });

  describe('create a resource pack', () => {
    const files_data = create_resource_pack.resources.map((resource) =>
      Buffer.from(resource.title),
    );

    it('should return a resource pack', () => {
      return request(app.getHttpServer())
        .post('/resource-packs')
        .field('data', JSON.stringify(create_resource_pack))
        .attach('files', files_data[0], 'track_1')
        .attach('files', files_data[1], 'track_2')
        .attach('files', files_data[2], 'track_3')
        .expect(create_expected);
    });
  });

  describe('delete my release', () => {
    it('should return the resource pack', async () => {
      return await request(app.getHttpServer())
        .delete(`/resource-packs/${resource_pack._id}`)
        .expect(delete_expected);
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    app.close();
  });
});
