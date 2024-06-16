import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Vote } from './schemas/vote.schema';

@Injectable()
export class VoteService {
  constructor(
    @InjectModel('Vote')
    private voteModel: mongoose.Model<Vote>,
  ) {}

  async vote(id: string, targetUser: string, voteType: number) {
    const vote = await this.voteModel.findOne({
      user: id,
      targetUser: targetUser,
    });
    if (!vote) {
      const newVote = {
        user: id,
        targetUser: targetUser,
        voteType: voteType,
      };
      return await this.voteModel.create(newVote);
    }
    if (vote.voteType == voteType) {
      vote.voteType = 0;
      return await vote.save();
    }
    vote.voteType = voteType;
    return await vote.save();
  }

  async canVote(id: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 3600000);
    const userVote = await this.voteModel.findOne({
      user: id,
      updatedAt: { $gt: oneHourAgo },
    });
    if (userVote) return false;
    return true;
  }
}
