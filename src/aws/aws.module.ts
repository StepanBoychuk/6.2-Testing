import { Module } from '@nestjs/common';
import { AwsController } from './aws.controller';
import { AwsService } from './aws.service';
import { UpdateUsersAvatarUrl } from './scheduledTasks/updateUsersAvatarUrl';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [AwsController],
  providers: [AwsService, UpdateUsersAvatarUrl],
})
export class AwsModule {}
