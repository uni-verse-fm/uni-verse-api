import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Database } from './database';
import { DatabaseModule } from './database/database.module';
import { ReleasesModule } from './releases/releases.module';
import { ResourcePacksModule } from './resource-packs/resource-packs.module';
import { PlaylistsModule } from './playlists/playlists.module';
@Module({
  imports: [
    AuthModule,
    UsersModule,
    ReleasesModule,
    ResourcePacksModule,
    PlaylistsModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [Database],
})
export class AppModule {}
