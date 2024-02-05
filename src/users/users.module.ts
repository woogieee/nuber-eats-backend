import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { Verification } from './entities/verification.entity';
import { UserGPS } from './entities/user-gps.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserGPS, Verification])],
  providers: [UsersResolver, UsersService, ConfigService],
  exports: [UsersService],
})
export class UsersModule {}
