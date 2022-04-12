import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import ReleasesModule from './releases/releases.module';
import UsersModule from './users/users.module';
import { WelcomeController } from './welcome.controller';
import { TracksModule } from './tracks/tracks.module';
import { FilesModule } from './files/files.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { ResourcesModule } from './resources/resources.module';
import { ResourcePacksModule } from './resource-packs/resource-packs.module';
import { CommentsModule } from './comments/comments.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        MONGO_HOSTNAME: Joi.string().required(),
        MONGO_USERNAME: Joi.string().required(),
        MONGO_PASSWORD: Joi.string().required(),
        MONGO_DATABASE: Joi.string().required(),
        MONGO_PORT: Joi.number().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        PORT: Joi.number(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const username = configService.get('MONGO_USERNAME');
        const password = configService.get('MONGO_PASSWORD');
        const database = configService.get('MONGO_DATABASE');
        const hostName = configService.get('MONGO_HOSTNAME');
        const port = configService.get('MONGO_PORT');

        return {
          uri: `mongodb://${username}:${password}@${hostName}:${port}`,
          dbName: database,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ReleasesModule,
    TracksModule,
    FilesModule,
    PlaylistsModule,
    ResourcesModule,
    ResourcePacksModule,
    CommentsModule,
  ],
  controllers: [WelcomeController],
  providers: [],
})
export class AppModule {}
