import { Test, TestingModule } from '@nestjs/testing';
import { MinioClientService } from '../minio-client/minio-client.service';
import { FilesService } from './files.service';

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
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

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
