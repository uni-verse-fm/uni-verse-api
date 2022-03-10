import { Module } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import { ReleasesController } from './releases.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Release, ReleaseSchema } from './schemas/release.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Release.name, schema: ReleaseSchema }]),
    ],
    controllers: [ReleasesController],
    providers: [ReleasesService],
    exports: [ReleasesService],
})
class ReleasesModule { }

export default ReleasesModule;