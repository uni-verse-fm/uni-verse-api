import * as Joi from '@hapi/joi';
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
import * as winston from 'winston';
import * as path from 'path';

import ecsFormat = require('@elastic/ecs-winston-format');
import { ClientRMQ, ClientsModule, Transport } from '@nestjs/microservices';
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
        STRIPE_SECRET_KEY: Joi.string(),
        STRIPE_CURRENCY: Joi.string(),
        FRONTEND_URL: Joi.string(),
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
        new winston.transports.File({
          filename: 'universe-api.log',
          dirname: path.join(__dirname, '../logs'),
        }),
      ],
    }),
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'fp_in_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
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
  ],
  controllers: [WelcomeController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
  }
}
