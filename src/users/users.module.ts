import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import ReleasesModule from '../releases/releases.module';
import { ReleasesService } from '../releases/releases.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        ReleasesModule
    ],
    controllers: [UsersController],
    providers: [UsersService, ReleasesService],
    exports: [UsersService],
})

class UsersModule { }

export default UsersModule; 
