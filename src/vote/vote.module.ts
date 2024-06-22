import { Module } from '@nestjs/common';
import { VoteController } from './vote.controller';
import { VoteService } from './vote.service';
import { MongooseModule } from '@nestjs/mongoose';
import { VoteSchema } from './schemas/vote.schema';
import { UpdateUsersRating } from './scheduledTasks/updateUsersRating';
import { UsersModule } from 'src/users/users.module';
import { UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Vote', schema: VoteSchema },
      { name: 'User', schema: UserSchema },
    ]),
    UsersModule,
  ],
  controllers: [VoteController],
  providers: [VoteService, UpdateUsersRating],
})
export class VoteModule {}
