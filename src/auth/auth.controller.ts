import { Body, Controller, Post, Res } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { AuthService } from './auth.service';
import { User } from 'src/users/schemas/user.schema';
import { SignInDto } from './dto/signIn.dto';
import { Response } from 'express';

@Controller('api/users')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body()
    user: CreateUserDto,
  ): Promise<User> {
    return this.authService.signUp(user);
  }

  @Post('signin')
  async signIn(
    @Body()
    signInDto: SignInDto,
    @Res() res: Response,
  ) {
    const token = await this.authService.signIn(signInDto);
    res
      .set('Authorization', 'Bearer ' + token)
      .status(200)
      .send();
  }
}
