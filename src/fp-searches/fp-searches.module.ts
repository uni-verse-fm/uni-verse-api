import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RMQModule } from 'src/rmq-client/rmq-client.module';
import { TracksModule } from 'src/tracks/tracks.module';
import { FilesModule } from '../files/files.module';
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
    FilesModule,
  ],
  controllers: [FpSearchesController],
  providers: [FpSearchesService],
  exports: [FpSearchesService],
})
export class FpSearchesModule {}
