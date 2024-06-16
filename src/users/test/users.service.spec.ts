import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { UpdateUserDto } from '../dto/updateUser.dto';

const mockUser = (id: string) => ({
  _id: id,
  username: 'testusername',
  firstName: 'testfirstname',
  lastName: 'testlastname',
  avatarURL: 'http://exampleurl.com',
  rating: 3,
  deletedAt: undefined,
});

describe('UsersService', () => {
  let usersService: UsersService;
  let userModel: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: {
            find: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue([mockUser('1')]),
              }),
            }),
            findById: jest.fn().mockReturnValue(mockUser('1')),
            findByIdAndUpdate: jest.fn().mockReturnValue(mockUser('1')),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken('User'));
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await usersService.findAll(1, 10);
      expect(result).toEqual([mockUser('1')]);
      expect(userModel.find).toHaveBeenCalled();
    });
  });

  describe('findOneById', () => {
    it('should return user by ID', async () => {
      const result = await usersService.findOneById('1');
      expect(result).toEqual(mockUser('1'));
      expect(userModel.findById).toHaveBeenCalledWith(
        { _id: '1' },
        'username firstName lastName avatarURL rating createdAt updatedAt',
      );
    });
  });

  describe('update', () => {
    it('should update a user and return the updated user', async () => {
      const updateUserDto = {
        firstName: 'Updated',
      } as unknown as UpdateUserDto;
      const result = await usersService.update('1', updateUserDto);
      expect(result).toEqual(mockUser('1'));
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: '1' },
        updateUserDto,
        { new: true, select: 'username firstName lastName rating avatarURL' },
      );
    });
  });

  describe('delete', () => {
    it('should soft delete user and return the deletion time', async () => {
      const result = await usersService.delete('1');
      expect(result).toEqual(mockUser('1'));
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: '1' },
        { deletedAt: expect.any(Number) },
        { new: true, select: 'deletedAt' },
      );
    });
  });
});
