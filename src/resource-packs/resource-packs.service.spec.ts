import { Test, TestingModule } from '@nestjs/testing';
import { ResourcePacksService } from './resource-packs.service';

describe('ResourcePacksService', () => {
  let service: ResourcePacksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResourcePacksService],
    }).compile();

    service = module.get<ResourcePacksService>(ResourcePacksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
