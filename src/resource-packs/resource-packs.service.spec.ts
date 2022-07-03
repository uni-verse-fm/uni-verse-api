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
import { UserSearchServiceMock } from '../test-utils/mocks/users-search.service.test';
import { MinioServiceMock } from '../test-utils/mocks/minio.service.test';
import { PaymentServiceMock } from '../test-utils/mocks/payment.service.test';
import { FileMimeType } from '../files/dto/simple-create-file.dto';
import { AccessType } from './dto/create-resource-pack.dto';
import { PacksSearchServiceMock } from '../test-utils/mocks/packs-search.service.test';
import { TransactionsService } from '../transactions/transactions.service';
import {
  Transaction,
  TransactionSchema,
} from '../transactions/schemas/transaction.schema';


const resource_pack1 = data.create_resource_packs.resource_pack1;
const resource_pack2 = data.create_resource_packs.resource_pack2;
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
          {
            name: Transaction.name,
            schema: TransactionSchema,
          },
        ]),
      ],
      providers: [
        ResourcePacksService,
        ResourcesService,
        FilesService,
        UsersService,
        TransactionsService,
        MinioServiceMock,
        PaymentServiceMock,
        UserSearchServiceMock,
        PacksSearchServiceMock,
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

    const coverFile = data.create_files.coverFile;
    const coverName = 'https://www.example.com';
    const cover = {
      ...coverFile,
      mimetype: FileMimeType[coverFile.mimetype],
      buffer: Buffer.from(JSON.parse(JSON.stringify(coverFile.buffer))),
    };
    const previews = [
      {
        ...data.create_files.preview_1,
        buffer: Buffer.from(
          JSON.parse(JSON.stringify(data.create_files.preview_1.buffer)),
        ),
      },
    ];

    const rp_1_files = data.create_files.resources_pack_1;
    const resource_packs1_files = (rp_1_files as Array<any>).map((file) => ({
      ...file,
      buffer: Buffer.from(JSON.parse(JSON.stringify(file.buffer))),
    }));
    it('should return first resource pack infos', async () => {

      const resources = data2list(resource_pack1.resources);

      const create_resource_pack = {
        ...resource_pack1,
        accessType: AccessType.Free,
        resources,
      };

      const expected = {
        title: resource_pack1.title,
        description: resource_pack1.description,
        coverName,
        author: {
          id: users[0].id,
          username: users[0].username,
          email: users[0].email,
          profilePicture: undefined,
        },
      };

      const result = await resourcePacksService.createResourcePack(
        resource_packs1_files,
        previews,
        cover,
        create_resource_pack,
        users[0],
      );
      expect(result).toStrictEqual(expected);
    });

    const rp_2_files = data.create_files.resources_pack_2;
    const resource_packs2_files = (rp_2_files as Array<any>).map((file) => ({
      ...file,
      buffer: Buffer.from(JSON.parse(JSON.stringify(file.buffer))),
    }));
    it('should return second resource pack infos', async () => {
      const resources = data2list(resource_pack2.resources);

      const create_resource_pack = {
        ...resource_pack2,
        accessType: AccessType.Free,
        resources,
      };

      const expected = {
        title: resource_pack2.title,
        description: resource_pack2.description,
        coverName,
        author: {
          id: users[0].id,
          username: users[0].username,
          email: users[0].email,
          profilePicture: undefined,
        },
      };

      const result = await resourcePacksService.createResourcePack(
        resource_packs2_files,
        previews,
        cover,
        create_resource_pack,
        users[0],
      );
      expect(result).toStrictEqual(expected);
    });
  });

  describe('When find all resource packs', () => {
    const coverName = 'https://www.example.com';

    it('should return a list of resource packs', async () => {
      const expected1 = {
        title: resource_pack1.title,
        description: resource_pack1.description,
        coverName,
        author: abdou._id.toString(),
      };

      const expected2 = {
        title: resource_pack2.title,
        description: resource_pack2.description,
        coverName,
        author: yoni._id.toString(),
      };

      const expected = [expected1, expected2];

      const result = await resourcePacksService.findAllResourcePacks();

      const cleanedResult = result.map((release) => ({
        title: release.title,
        description: release.description,
        coverName: release.coverName,
        author: release.author._id.toString(),
      }));
      expect(cleanedResult).toStrictEqual(expected);
    });
  });

  describe('When find one resource pack by title', () => {
    it('should return one resource pack', async () => {
      const coverName = 'https://www.example.com';
      const description = 'my resource pack 1';
      const title = 'resource pack 1';

      const result = await resourcePacksService.findResourcePackByTitle(
        resource_pack1.title,
      );

      resourcePackId = result._id.toString();

      expect(result.title).toBe(title);
      expect(result.description).toBe(description);
      expect(result.coverName).toBe(coverName);
      expect(result.author._id).toStrictEqual(abdou._id);
      expect(result.resources).toBeDefined();
    });
  });

  describe('When find one resource pack by id', () => {
    it('should return one resource pack', async () => {
      const coverName = 'https://www.example.com';
      const description = 'my resource pack 1';
      const title = 'resource pack 1';

      const result = await resourcePacksService.findResourcePackById(
        resourcePackId,
      );

      expect(result.title).toBe(title);
      expect(result.description).toBe(description);
      expect(result.coverName).toBe(coverName);
      expect(result.author.username).toBe(abdou.username);
      expect(result.author.email).toBe(abdou.email);
      expect(result.author._id).toStrictEqual(abdou._id);
      expect(result.resources).toBeDefined();
    });
  });

  describe('When remove one resource pack', () => {
    it('should return one resource pack infos', async () => {
      const title = 'resource pack 1';
      const msg = 'ResourcePack deleted';

      const result = await resourcePacksService.removeResourcePack(
        resourcePackId,
        abdou,
      );
      expect(result.id).toStrictEqual(resourcePackId);
      expect(result.title).toStrictEqual(title);
      expect(result.msg).toStrictEqual(msg);
    });
  });
});
