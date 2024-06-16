import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('api/users')
export class UsersController {
  constructor(private usersServise: UsersService) {}

  @Get()
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 4,
  ): Promise<User[]> {
    return this.usersServise.findAll(page, perPage);
  }

  @Get(':id')
  async findOne(
    @Param('id')
    id: string,
    @Res() res: Response,
  ) {
    const user: any = await this.usersServise.findOneById(id);
    res.set('Last-Modified', user.updatedAt).send(user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto,
  ): Promise<User> {
    return this.usersServise.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param('id') id: string): Promise<User> {
    return this.usersServise.delete(id);
  }
}
