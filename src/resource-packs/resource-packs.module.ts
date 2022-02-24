import { Module } from '@nestjs/common';
import { ResourcePacksService } from './resource-packs.service';
import { ResourcePacksController } from './resource-packs.controller';

@Module({
  controllers: [ResourcePacksController],
  providers: [ResourcePacksService],
})
export class ResourcePacksModule {}
