import { Module } from '@nestjs/common';
import { FilesService } from './files.service';

@Module({
  controllers: [],
  providers: [FilesService],
})
export class FilesModule {}
