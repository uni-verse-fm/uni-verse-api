import { Test, TestingModule } from '@nestjs/testing';
import { ResourcePacksController } from './resource-packs.controller';
import { ResourcePacksService } from './resource-packs.service';

describe('ResourcePacksController', () => {
  let controller: ResourcePacksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcePacksController],
      providers: [ResourcePacksService],
    }).compile();

    controller = module.get<ResourcePacksController>(ResourcePacksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
