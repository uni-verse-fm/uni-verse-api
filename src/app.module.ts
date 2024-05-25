/* Copyright (c) 2022 uni-verse corp */

import * as Joi from 'joi';
import { MiddlewareConsumer, Module } from '@nestjs/common';
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
import { MinioClientModule } from './minio-client/minio-client.module';
import { PaymentsModule } from './payments/payments.module';
import { HealthModule } from './health/health.module';
import { PrometheusModule } from './prometheus/prometheus.module';
import { MetricsModule } from './metrics/metrics.module';
import { SearchModule } from './search/search.module';
import LogsMiddleware from './utils/middlewares/logs.middleware';
import { utilities, WinstonModule } from 'nest-winston';
import { ViewsModule } from './views/views.module';
import { TransactionsModule } from './transactions/transactions.module';
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

import { ecsFormat } from '@elastic/ecs-winston-format';
import DailyRotateFile = require('winston-daily-rotate-file');
import { FpSearchesModule } from './fp-searches/fp-searches.module';
import { FeatRequestsModule } from './feat-requests/feat-requests.module';
import { MessagesModule } from './messages/messages.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_HOSTNAME: Joi.string().required(),
        MONGO_USERNAME: Joi.string().required(),
        MONGO_PASSWORD: Joi.string().required(),
        MONGO_DATABASE: Joi.string().required(),
        MONGO_PORT: Joi.number().required(),
        MINIO_ROOT: Joi.string().required(),
        MINIO_ROOT_USER: Joi.string().required(),
        MINIO_ROOT_PASSWORD: Joi.string().required(),
        MINIO_PORT: Joi.number().required(),
        MINIO_ENDPOINT: Joi.string().required(),
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        UNIVERSE_DONATION_PRODUCT_ID: Joi.string().required(),
        STRIPE_SECRET_KEY: Joi.string().required(),
        STRIPE_WEBHOOK_SECRET: Joi.string().required(),
        ONBOARD_REFRESH_URL: Joi.string().required(),
        STRIPE_CURRENCY: Joi.string().required(),
        FRONTEND_URL: Joi.string().required(),
        PORT: Joi.number(),
        RMQ_URL: Joi.string().required(),
        RMQ_PORT: Joi.number().required(),
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
    WinstonModule.forRoot({
      format: ecsFormat(),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            utilities.format.nestLike('Uni Verse Fm', { prettyPrint: true }),
          ),
        }),
        new DailyRotateFile({
          filename: 'universe-api-%DATE%.log',
          dirname: path.join(__dirname, '../logs'),
          datePattern: 'YYYY-MM-DD-HH',
          maxSize: '20m',
          maxFiles: '3d',
        }).on('rotate', (oldFilename) => {
          fs.unlinkSync(oldFilename);
        }),
      ],
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
    MinioClientModule,
    PaymentsModule,
    HealthModule,
    PrometheusModule,
    MetricsModule,
    SearchModule,
    ViewsModule,
    TransactionsModule,
    FpSearchesModule,
    FeatRequestsModule,
    MessagesModule,
  ],
  controllers: [WelcomeController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
  }
}
