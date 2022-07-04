/* Copyright (c) 2022 uni-verse corp */

import { Module } from '@nestjs/common';
import { ViewsService } from './views.service';
import { ViewsController } from './views.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { View, ViewSchema } from './schemas/view.schema';
import { TracksModule } from '../tracks/tracks.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: View.name, schema: ViewSchema }]),
    TracksModule,
  ],
  controllers: [ViewsController],
  providers: [ViewsService],
})
export class ViewsModule {}
