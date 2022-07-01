import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesService } from 'src/files/files.service';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { RMQModule } from 'src/rmq-client/rmq-client.module';
import { TracksModule } from 'src/tracks/tracks.module';
import { FpSearchesController } from './fp-searches.controller';
import { FpSearchesService } from './fp-searches.service';
import { FpSearch, FpSearchSchema } from './schemas/fp-search.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FpSearch.name, schema: FpSearchSchema },
    ]),
    RMQModule,
    TracksModule,
  ],
  controllers: [FpSearchesController],
  providers: [FpSearchesService, FilesService, MinioClientService],
  exports: [FpSearchesService],
})
export class FpSearchesModule {}
