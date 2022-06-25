import { FilesModule } from './../files/files.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { PaymentsService } from '../payments/payments.service';
import { SearchModule } from '../search/search.module';
import UsersSearchService from './users-search.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SearchModule,
    FilesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, PaymentsService, UsersSearchService],
  exports: [UsersService, UsersSearchService],
})
class UsersModule {}

export default UsersModule;
