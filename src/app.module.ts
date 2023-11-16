import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      // 어플리케이션 어디서나 config 모듈에 접근가능
      isGlobal: true,
      // 시작환경에 따라 폴더에서 .env 파일을 읽음
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      // 서버에 deploy 할 때 환경변수 파일을 사용하지 않는다.
      // process.env.NODE_ENV 값이 prod 일때만 true
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      // joi를 이용한 유효성 검사
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod',
      logging: process.env.NODE_ENV !== 'prod',
      // entities 때문에 Restaurant가 DB가 됨
      entities: [User],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // 메모리로 파일을 만들어냄.
      autoSchemaFile: true,
    }),
    UsersModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

console.log('NODE_ENV === ' + process.env.NODE_ENV);
console.log('DB_HOST ==== ' + process.env.DB_HOST);
console.log('DB_PORT ==== ' + +process.env.DB_PORT);
console.log('DB_USERNAME ==== ' + process.env.DB_USERNAME);
console.log('DB_PASSWORD ==== ' + process.env.DB_PASSWORD);
console.log('DB_NAME ==== ' + process.env.DB_NAME);
