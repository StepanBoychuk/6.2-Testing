import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { IfUserExistMiddleware } from './middlewares/ifUserExist.middleware';
import { IfUnmodifiedSinceMiddleware } from './middlewares/ifUnmodifiedSince.middleware';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IfUserExistMiddleware)
      .forRoutes(
        { path: 'api/users/:id', method: RequestMethod.GET },
        { path: 'api/users/:id', method: RequestMethod.PUT },
      );
    consumer
      .apply(IfUnmodifiedSinceMiddleware)
      .forRoutes({ path: 'api/users/:id', method: RequestMethod.PUT });
  }
}
