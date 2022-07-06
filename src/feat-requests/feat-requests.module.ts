import { forwardRef, Module } from '@nestjs/common';
import { FeatRequestsService } from './feat-requests.service';
import { FeatRequestsController } from './feat-requests.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FeatRequest, FeatRequestSchema } from './schemas/request-feat.schema';
import { TracksModule } from '../tracks/tracks.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeatRequest.name, schema: FeatRequestSchema },
    ]),
    forwardRef(() => TracksModule),
  ],
  controllers: [FeatRequestsController],
  providers: [FeatRequestsService],
  exports: [FeatRequestsService],
})
export class FeatRequestsModule {}
