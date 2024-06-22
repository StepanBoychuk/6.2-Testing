import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Vote {
  @Prop({ ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ ref: 'User', required: true })
  targetUser: Types.ObjectId;

  @Prop({ enum: [1, 0, -1], required: true })
  voteType: number;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
