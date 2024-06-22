import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { VoteModule } from './vote/vote.module';
import { ConfigModule } from '@nestjs/config';
import { AwsModule } from './aws/aws.module';
import { HashModule } from './hash/hash.module';

let envFile = '.env';
if (process.env.NODE_ENV == 'test') {
  envFile = '.env.test';
}

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFile,
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      `mongodb://${process.env.DB_URL}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    ),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    VoteModule,

    AwsModule,

    HashModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
