import { Module } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import { ReleasesController } from './releases.controller';

@Module({
  controllers: [ReleasesController],
  providers: [ReleasesService],
})
export class ReleasesModule {}
