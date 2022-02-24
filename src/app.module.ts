import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

const mongoHostName = process.env.MONGO_HOSNAME || 'localhost';
const mongoUsername = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoPort = process.env.MONGO_PORT || 27017;
@Module({
  imports: [
    AuthModule, 
    UsersModule,
    MongooseModule.forRoot(`mongodb://${mongoUsername}:${mongoPassword}@${mongoHostName}:${mongoPort}`),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
