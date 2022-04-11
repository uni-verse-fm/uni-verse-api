import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { data2list } from '../test-utils/mocks/standard-mock.service.test';
import { User, UserDocument, UserSchema } from '../users/schemas/user.schema';
import * as data from '../test-utils/data/mock_data.json';
import { Resource, ResourceSchema } from '../resources/schemas/resource.schema';
import { ResourcesService } from '../resources/resources.service';
import { FilesService } from '../files/files.service';
import { UsersService } from '../users/users.service';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../test-utils/in-memory/mongoose.helper.test';
import { ResourcePacksService } from './resource-packs.service';
import {
  ResourcePack,
  ResourcePackSchema,
} from './schemas/resource-pack.schema';

const resource_packs = data2list(data.resource_packs);

const create_resource_packs = data2list(data.create_resource_packs);
const files = [
  data.create_files.resources_pack_1,
  data.create_files.resources_pack_2,
];

const abdou_user = data.create_users.abdou;
const yoni_user = data.create_users.yoni;

describe('ResourcePacksService', () => {
  let resourcePacksService: ResourcePacksService;
  let usersService: UsersService;
  let module: TestingModule;
  let resourcePackId: string;
  let abdou: UserDocument;
  let yoni: UserDocument;
  let users = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          {
            name: ResourcePack.name,
            schema: ResourcePackSchema,
          },
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
        ResourcePacksService,
        ResourcesService,
        FilesService,
        UsersService,
      ],
    }).compile();

    resourcePacksService =
      module.get<ResourcePacksService>(ResourcePacksService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
      await closeInMongodConnection();
    }
  });

  describe('When create one resource pack', () => {
    it('', async () => {
      const createdUser1 = await usersService.createUser(abdou_user);
      expect(createdUser1.email).toBe(abdou_user.email);
      expect(createdUser1.username).toBe(abdou_user.username);

      const createdUser2 = await usersService.createUser(yoni_user);
      expect(createdUser2.email).toBe(yoni_user.email);
      expect(createdUser2.username).toBe(yoni_user.username);

      abdou = await usersService.findUserByEmail(createdUser1.email);
      expect(abdou.id).toBeDefined();

      yoni = await usersService.findUserByEmail(createdUser1.email);
      expect(yoni.id).toBeDefined();

      users = [abdou, yoni];
    });

    create_resource_packs.forEach((resourcePack, resourcePackIndex) => {
      const test = files[resourcePackIndex];
      const files_resource_packs = (test as Array<any>).map((file) => ({
        ...file,
        buffer: Buffer.from(JSON.parse(JSON.stringify(file.buffer))),
      }));

      it('should return one resource pack infos', async () => {
        // the author made the two albums
        const resources = data2list(resourcePack.resources);

        const create_resource_pack = {
          ...resourcePack,
          resources,
        };

        const expected = {
          title: resourcePack.title,
          description: resourcePack.description,
          coverUrl: resourcePack.coverUrl,
          previewUrl: resourcePack.previewUrl,
          author: {
            id: users[resourcePackIndex].id,
            username: users[resourcePackIndex].username,
            email: users[resourcePackIndex].email,
          },
        };

        const result = await resourcePacksService.createResourcePack(
          files_resource_packs,
          create_resource_pack,
          users[resourcePackIndex],
        );
        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('When find all resource packs', () => {
    it('should return a list of resource packs', async () => {
      // the author made the two albums

      const expected1 = {
        title: resource_packs[0].title,
        description: resource_packs[0].description,
        coverUrl: resource_packs[0].coverUrl,
        author: abdou._id.toString(),
      };

      const expected2 = {
        title: resource_packs[1].title,
        description: resource_packs[1].description,
        coverUrl: resource_packs[1].coverUrl,
        author: yoni._id.toString(),
      };

      const expected = [expected1, expected2];

      const result = await resourcePacksService.findAllResourcePacks();

      const cleanedResult = result.map((release) => ({
        title: release.title,
        description: release.description,
        coverUrl: release.coverUrl,
        author: release.author._id.toString(),
      }));
      expect(cleanedResult).toStrictEqual(expected);
    });
  });

  describe('When find one resource pack by title', () => {
    it('should return one resource pack', async () => {
      const coverUrl = 'https://www.resource-pack.com';
      const previewUrl = 'https://www.resource-pack.com';
      const description = 'my resource pack 1';
      const title = 'resource pack 1';

      const result = await resourcePacksService.findResourcePackByTitle(
        data.resource_packs.resource_pack1.title,
      );

      resourcePackId = result._id.toString();

      expect(result.title).toBe(title);
      expect(result.description).toBe(description);
      expect(result.coverUrl).toBe(coverUrl);
      expect(result.previewUrl).toBe(previewUrl);
      expect(result.author).toStrictEqual(abdou._id);
      expect(result.resources).toBeDefined();
    });
  });

  describe('When find one resource pack by id', () => {
    it('should return one resource pack', async () => {
      const coverUrl = 'https://www.resource-pack.com';
      const previewUrl = 'https://www.resource-pack.com';
      const description = 'my resource pack 1';
      const title = 'resource pack 1';

      const result = await resourcePacksService.findResourcePackById(
        resourcePackId,
      );

      expect(result.title).toBe(title);
      expect(result.description).toBe(description);
      expect(result.coverUrl).toBe(coverUrl);
      expect(result.previewUrl).toBe(previewUrl);
      expect(result.author).toStrictEqual(abdou._id);
      expect(result.resources).toBeDefined();
    });
  });

  describe('When remove one resource pack', () => {
    it('should return one resource pack infos', async () => {
      const title = 'resource pack 1';
      const msg = 'ResourcePack deleted';

      const result = await resourcePacksService.removeResourcePack(
        resourcePackId,
        abdou
      );
      expect(result.id).toStrictEqual(resourcePackId);
      expect(result.title).toStrictEqual(title);
      expect(result.msg).toStrictEqual(msg);
    });
  });
});
