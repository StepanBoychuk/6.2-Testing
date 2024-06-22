import { Post, Body, Controller, UseGuards } from '@nestjs/common';
import { AwsService } from './aws.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AvatarDto } from './dto/avatarUpload.dto';
import { UserDecorator } from 'src/users/decorators/user.decorator';

@Controller('api/users')
export class AwsController {
  constructor(private awsService: AwsService) {}

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  async getLink(@Body() avatarDto: AvatarDto, @UserDecorator() user) {
    return this.awsService.getPresignedURL(user.id, avatarDto.fileName);
  }
}
