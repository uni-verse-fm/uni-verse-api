import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from '../files/files.service';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../test-utils/in-memory/mongoose.helper.test';
import { data2list } from '../test-utils/mocks/standard-mock.service.test';
import { User, UserDocument, UserSchema } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { ResourcesService } from './resources.service';
import {
  Resource,
  ResourceDocument,
  ResourceSchema,
} from './schemas/resource.schema';
import * as data from '../test-utils/data/mock_data.json';
import { MinioClientService } from '../minio-client/minio-client.service';

const create_user = data.create_users.abdou;

const resources = data2list(data.create_resources);
describe('ResourcesService', () => {
  let resourcesService: ResourcesService;
  let usersService: UsersService;
  let module: TestingModule;
  let first_resource: ResourceDocument;
  let user: UserDocument;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          {
            name: Resource.name,
            schema: ResourceSchema,
          },
          {
            name: User.name,
            schema: UserSchema,
          },
        ]),
      ],
      providers: [
        ResourcesService,
        FilesService,
        UsersService,
        {
          provide: MinioClientService,
          useValue: {
            upload: jest.fn(() => {
              return 'https://www.example.com';
            }),
          },
        },
      ],
    }).compile();

    resourcesService = module.get<ResourcesService>(ResourcesService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
      await closeInMongodConnection();
    }
  });

  describe('create resources', () => {
    it('', async () => {
      const created_user = await usersService.createUser(create_user);
      expect(created_user.email).toBe(create_user.email);
      expect(created_user.username).toBe(create_user.username);
      user = await usersService.findUserByEmail(create_user.email);
      expect(user.email).toBe(create_user.email);
      expect(user.username).toBe(create_user.username);
      expect(user.id).toBeDefined();
    });

    resources.forEach((resource) => {
      it(`should return resource ${resource.title} infos`, async () => {
        const fileName = 'https://www.example.com';

        const body = {
          ...resource,
          buffer: Buffer.from(JSON.parse(JSON.stringify(resource.buffer))),
          author: user._id,
        };

        const result = await resourcesService.createResource(body);
        expect(result.author).toBe(user._id);
        expect(result.title).toBe(resource.title);
        expect(result.fileName).toBe(fileName);
      });
    });
  });

  describe('When ask for all resources', () => {
    it('should return a list of resources', async () => {
      const expected = resources.map((resource) => ({
        title: resource.title,
        fileName: 'https://www.example.com',
      }));

      const result = await resourcesService.findAllResources();
      const cleanedResult = result.map((resource) => ({
        title: resource.title,
        fileName: resource.fileName,
      }));

      expect(cleanedResult).toStrictEqual(expected);

      result.forEach((resource) => {
        expect(resource._id).toBeDefined();
        expect(resource.author).toBeDefined();
      });
    });
  });

  describe('When ask one resource by title', () => {
    const title = 'resource 1';
    const fileName = 'https://www.example.com';

    it('should return one resource', async () => {
      first_resource = await resourcesService.findResourceByTitle(
        data.resources.resource_1.title,
      );
      expect(first_resource._id).toBeDefined();
      expect(first_resource.title).toBe(title);
      expect(first_resource.author).toBeDefined();
      expect(first_resource.fileName).toBe(fileName);
    });
  });

  describe('When ask one resource by id', () => {
    it('should return one resource', async () => {
      const result = await resourcesService.findResourceById(
        first_resource._id,
      );
      expect(result).toStrictEqual(first_resource);
    });
  });

  describe('When remove one resource', () => {
    it('should return one resource infos', async () => {
      const expected = {
        id: first_resource._id,
        title: first_resource.title,
        msg: 'Resource deleted',
      };

      const result = await resourcesService.removeResource(first_resource._id);
      expect(result).toStrictEqual(expected);
    });
  });
});
