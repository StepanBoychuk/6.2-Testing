import {
  Body,
  Controller,
  HttpException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { VoteDto } from './dto/vote.dto';
import { UserDecorator } from 'src/users/decorators/user.decorator';
import { VoteService } from './vote.service';

@Controller('api/users')
export class VoteController {
  constructor(private voteService: VoteService) {}
  @Post('vote')
  @UseGuards(JwtAuthGuard)
  async vote(@Body() voteDto: VoteDto, @UserDecorator() user) {
    if (user.id == voteDto.targetUser)
      throw new HttpException('You cannot vote for yourself', 400);
    if ((await this.voteService.canVote(user.id)) == false)
      throw new HttpException('You can vote once per hour', 429);
    return await this.voteService.vote(
      user.id,
      voteDto.targetUser,
      voteDto.voteType,
    );
  }
}
