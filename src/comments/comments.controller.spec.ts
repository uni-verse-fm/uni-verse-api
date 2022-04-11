import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import * as data from '../test-utils/data/mock_data.json';
import { TracksService } from '../tracks/tracks.service';
import { FilesService } from '../files/files.service';
import { UsersService } from '../users/users.service';
import { ResourcesService } from '../resources/resources.service';
import { getModelToken } from '@nestjs/mongoose';
import RepoMockModel, {
  data2list,
} from '../test-utils/mocks/standard-mock.service.test';
import { Track } from '../tracks/schemas/track.schema';
import { User } from '../users/schemas/user.schema';
import TracksRepoMockModel from '../test-utils/mocks/Tracks-mock.service.test';
import { Resource } from '../resources/schemas/resource.schema';

const owner = data.users.abdou;

const release = data.releases.black_album;
const comments = data2list(data.comments);

const comment1 = data.comments.comment_1;

const create_expected = {
  content: comment1.content,
  isPositive: comment1.isPositive,
  modelType: comment1.modelType,
  owner: comment1.owner,
};

const delete_expected = {
  msg: `Comment ${''} deleted`,
};

describe('CommentsController', () => {
  let controller: CommentsController;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET'),
            signOptions: { expiresIn: '6000s' },
          }),
        }),
      ],
      controllers: [CommentsController],
      providers: [
        TracksService,
        UsersService,
        ResourcesService,
        FilesService,
        {
          provide: CommentsService,
          useValue: {
            createComment: jest.fn(() => {
              return {
                ...create_expected,
              };
            }),
            findAllComments: jest.fn(() => {
              return comments;
            }),
            findCommentById: jest.fn(() => {
              return {
                ...release,
              };
            }),
            updateComment: jest.fn(() => {
              return {};
            }),
            removeComment: jest.fn(() => {
              return {
                ...delete_expected,
              };
            }),
            find: jest.fn(() => {
              return comments;
            }),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: new RepoMockModel(data.users, 4, 2),
        },
        {
          provide: getModelToken(Track.name),
          useValue: new TracksRepoMockModel(data.tracks),
        },
        {
          // TODO: to change with track like mock
          provide: getModelToken(Resource.name),
          useValue: new RepoMockModel(data.resources),
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = owner;
          return true;
        },
      })
      .compile();

    controller = module.get<CommentsController>(CommentsController);
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
