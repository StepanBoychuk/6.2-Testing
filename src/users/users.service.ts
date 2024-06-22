import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private userModel: mongoose.Model<User>,
  ) {}

  async findAll(page: number, perPage: number): Promise<User[]> {
    const users = await this.userModel
      .find({}, 'username firstName lastName avatarURL rating')
      .skip((page - 1) * perPage)
      .limit(perPage);
    return users;
  }

  async findOneById(id: string): Promise<User> {
    const user = this.userModel.findById(
      { _id: id },
      'username firstName lastName avatarURL rating createdAt updatedAt',
    );
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate({ _id: id }, updateUserDto, {
      new: true,
      select: 'username firstName lastName rating avatarURL',
    });
  }

  async delete(id: string): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      { _id: id },
      { deletedAt: Date.now() },
      { new: true, select: 'deletedAt' },
    );
  }
}
