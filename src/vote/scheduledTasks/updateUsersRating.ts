import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Vote } from '../schemas/vote.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UpdateUsersRating {
  constructor(
    @InjectModel('User') private userModel: mongoose.Model<User>,
    @InjectModel('Vote') private voteModel: mongoose.Model<Vote>,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async updateRating() {
    const users = await this.userModel.find({}, 'rating');
    users.forEach(async (user) => {
      const upvotes = await this.voteModel.countDocuments({
        targetUser: user.id,
        voteType: 1,
      });
      const downvotes = await this.voteModel.countDocuments({
        targetUser: user.id,
        voteType: -1,
      });
      const ratingSum = upvotes - downvotes;
      if (ratingSum != user.rating) {
        user.rating = ratingSum;
        await user.save();
      }
    });
  }
}
