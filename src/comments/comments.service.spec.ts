import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ICreateResourceResponse } from '../resources/interfaces/resource-create-response.interface';
import { ResourcesService } from '../resources/resources.service';
import { Resource, ResourceSchema } from '../resources/schemas/resource.schema';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../test-utils/in-memory/mongoose.helper.test';
import { ICreateTrackResponse } from '../tracks/interfaces/track-create-response.interface';
import { Track, TrackSchema } from '../tracks/schemas/track.schema';
import { TracksService } from '../tracks/tracks.service';
import { User, UserDocument, UserSchema } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { CommentsService } from './comments.service';
import * as data from '../test-utils/data/mock_data.json';
import { ModelType } from './dto/create-comment.dto';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { FilesService } from '../files/files.service';
import { FileMimeType } from '../files/dto/simple-create-file.dto';
import { PaymentsService } from '../payments/payments.service';
import { UserSearchServiceMock } from '../test-utils/mocks/users-search.service.test';
import { MinioServiceMock } from '../test-utils/mocks/minio.service.test';

const abdou = data.users.abdou;
const jayz = data.users.jayz;
const encoreTrack = data.create_tracks.encore;
const threatTrack = data.create_tracks.threat;
const resourceOnResource = data.create_resources.resource1;
const commentOneComment = data.create_comments.comment_1;
const commentTwoComment = data.create_comments.comment_2;
const commentThreeComment = data.create_comments.comment_3;
const commentOneResult = data.comments.comment_1;
const commentTwoResult = data.comments.comment_2;
const commentThreeResult = data.comments.comment_3;

let user: UserDocument;
let artist: UserDocument;
let encore: ICreateTrackResponse;
let threat: ICreateTrackResponse;
let resourceOne: ICreateResourceResponse;
let commentId: string;
describe('CommentsService', () => {
  let commentService: CommentsService;
  let usersService: UsersService;
  let tracksService: TracksService;
  let resourcesService: ResourcesService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          {
            name: Comment.name,
            schema: CommentSchema,
          },
          {
            name: Resource.name,
            schema: ResourceSchema,
          },
          {
            name: Track.name,
            schema: TrackSchema,
          },
          {
            name: User.name,
            schema: UserSchema,
          },
        ]),
      ],
      providers: [
        CommentsService,
        TracksService,
        UsersService,
        ResourcesService,
        FilesService,
        MinioServiceMock,
        {
          provide: PaymentsService,
          useValue: {
            createCustomer: jest.fn(() => {
              return { id: 1 };
            }),
          },
        },
        UserSearchServiceMock,
      ],
    }).compile();

    commentService = module.get<CommentsService>(CommentsService);
    usersService = module.get<UsersService>(UsersService);
    tracksService = module.get<TracksService>(TracksService);
    resourcesService = module.get<ResourcesService>(ResourcesService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
      await closeInMongodConnection();
    }
  });

  describe('When create one comment', () => {
    it('', async () => {
      const createdUser = await usersService.createUser(
        data.create_users.abdou,
      );
      const createdArtist = await usersService.createUser(
        data.create_users.jayz,
      );
      user = await usersService.findUserByEmail(createdUser.email);
      artist = await usersService.findUserByEmail(createdArtist.email);
      expect(user.email).toBe(abdou.email);
      expect(user.username).toBe(abdou.username);
      expect(artist.email).toBe(jayz.email);
      expect(artist.username).toBe(jayz.username);
    });

    it('', async () => {
      const encoreBuffer = Buffer.from(
        JSON.parse(JSON.stringify(encoreTrack.buffer)),
      );
      const threatBuffer = Buffer.from(
        JSON.parse(JSON.stringify(threatTrack.buffer)),
      );
      const commonTrackInfos = {
        fileName: 'https://www.example.com',
        feats: [],
        author: artist,
      };

      encore = await tracksService.createTrack({
        ...commonTrackInfos,
        title: encoreTrack.title,
        file: {
          originalFileName: encoreTrack.originalFileName,
          buffer: Buffer.from(JSON.parse(JSON.stringify(encoreTrack.buffer))),
          size: 4000,
          mimetype: FileMimeType.MPEG,
        },
        originalFileName: encoreTrack.originalFileName,
      });

      threat = await tracksService.createTrack({
        ...commonTrackInfos,
        title: threatTrack.title,
        file: {
          originalFileName: threatTrack.originalFileName,
          buffer: Buffer.from(JSON.parse(JSON.stringify(threatTrack.buffer))),
          size: 4000,
          mimetype: FileMimeType.MPEG,
        },
        originalFileName: threatTrack.originalFileName,
      });
      expect(encore.id).toBeDefined();
      expect(threat.id).toBeDefined();
    });

    it('', async () => {
      const resourceBuffer = Buffer.from(
        JSON.parse(JSON.stringify(resourceOnResource.buffer)),
      );

      resourceOne = await resourcesService.createResource({
        ...resourceOnResource,
        file: {
          buffer: resourceBuffer,
          size: 400,
          originalFileName: resourceOnResource.originalFileName,
          mimetype: FileMimeType.MPEG,
        },
        author: user,
      });
      expect(encore.id).toBeDefined();
      expect(threat.id).toBeDefined();
    });

    it('should return the first comment', async () => {
      const comment = await commentService.createComment(
        {
          ...commentOneComment,
          contentId: encore.id.toString(),
          typeOfContent: ModelType[commentOneComment.typeOfContent],
        },
        user,
      );
      commentId = comment._id;
      expect(comment._id).toBeDefined();
      expect(comment.content).toBe(commentOneResult.content);
      expect(comment.isPositive).toBe(commentOneResult.isPositive);
      expect(comment.modelType).toBe(commentOneResult.modelType);
      expect(comment.owner.email).toBe(commentOneResult.owner.email);
      expect(comment.owner.username).toBe(commentOneResult.owner.username);
    });

    it('should return the second comment', async () => {
      const comment = await commentService.createComment(
        {
          ...commentTwoComment,
          contentId: threat.id.toString(),
          typeOfContent: ModelType[commentTwoComment.typeOfContent],
        },
        user,
      );
      expect(comment._id).toBeDefined();
      expect(comment.content).toBe(commentTwoResult.content);
      expect(comment.isPositive).toBe(commentTwoResult.isPositive);
      expect(comment.modelType).toBe(commentTwoResult.modelType);
      expect(comment.owner.email).toBe(commentTwoResult.owner.email);
      expect(comment.owner.username).toBe(commentTwoResult.owner.username);
    });

    it('should return the third comment', async () => {
      const comment = await commentService.createComment(
        {
          ...commentThreeComment,
          contentId: resourceOne._id.toString(),
          typeOfContent: ModelType[commentThreeComment.typeOfContent],
        },
        user,
      );
      expect(comment._id).toBeDefined();
      expect(comment.content).toBe(commentThreeResult.content);
      expect(comment.isPositive).toBe(commentThreeResult.isPositive);
      expect(comment.modelType).toBe(commentThreeResult.modelType);
      expect(comment.owner.email).toBe(commentThreeResult.owner.email);
      expect(comment.owner.username).toBe(commentThreeResult.owner.username);
    });
  });
  describe('When find all comment', () => {
    it('should return a list of releases', async () => {
      const comments = await commentService.findAllComments();
      expect(comments.length).toBe(3);
      expect(comments[0]._id).toBeDefined();
      expect(comments[0].content).toBe(commentOneResult.content);
      expect(comments[0].isPositive).toBe(commentOneResult.isPositive);
      expect(comments[0].modelType).toBe(commentOneResult.modelType);
      expect(comments[0].owner).toBeDefined();
      expect(comments[1]._id).toBeDefined();
      expect(comments[1].content).toBe(commentTwoResult.content);
      expect(comments[1].isPositive).toBe(commentTwoResult.isPositive);
      expect(comments[1].modelType).toBe(commentTwoResult.modelType);
      expect(comments[1].owner).toBeDefined();
      expect(comments[2]._id).toBeDefined();
      expect(comments[2].content).toBe(commentThreeResult.content);
      expect(comments[2].isPositive).toBe(commentThreeResult.isPositive);
      expect(comments[2].modelType).toBe(commentThreeResult.modelType);
      expect(comments[2].owner).toBeDefined();
    });
  });

  describe('When find one comment by id', () => {
    it('should return one release', async () => {
      const comment = await commentService.findCommentById(commentId);

      expect(comment._id).toBeDefined();
      expect(comment.content).toBe(commentOneResult.content);
      expect(comment.isPositive).toBe(commentOneResult.isPositive);
      expect(comment.modelType).toBe(commentOneResult.modelType);
      expect(comment.owner).toBeDefined();
    });
  });

  describe('When remove one comment', () => {
    it('should return one comment message', async () => {
      const msg = `Comment ${commentId} deleted`;
      const comment = await commentService.removeComment(commentId, user);
      expect(comment.msg).toBe(msg);
    });
  });
});
