import { IsIn, IsMongoId, IsNotEmpty } from 'class-validator';

export class VoteDto {
  @IsNotEmpty()
  @IsMongoId({ message: 'Wrong target user id' })
  targetUser: string;

  @IsNotEmpty()
  @IsIn([-1, 1])
  voteType: number;
}
