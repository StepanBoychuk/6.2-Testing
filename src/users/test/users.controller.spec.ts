import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../schemas/user.schema';
import { Response } from 'express';
import { UpdateUserDto } from '../dto/updateUser.dto';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOneById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const page = 1 as number; //default number
      const perPage = 4 as number; //default number
      const response = [{}, {}] as User[];
      jest.spyOn(usersService, 'findAll').mockResolvedValue(response);
      const result = await usersController.getAllUsers();
      expect(result).toBe(response);
      expect(usersService.findAll).toHaveBeenCalledWith(page, perPage);
    });
  });

  describe('findOne', () => {
    it('should return a user and set the Last-Modified header', async () => {
      const userId = 'someId' as string;
      const mockResponce = {
        set: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;
      const user = { _id: userId, updatedAt: new Date() } as any;
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(user);

      await usersController.findOne(userId, mockResponce);

      expect(usersService.findOneById).toHaveBeenCalledWith(userId);
      expect(mockResponce.set).toHaveBeenCalledWith(
        'Last-Modified',
        user.updatedAt,
      );
      expect(mockResponce.send).toHaveBeenCalledWith(user);
    });
  });

  describe('updateUser', () => {
    it('should update and return the user', async () => {
      const userId = 'someId' as string;
      const result = {} as User;
      const updateData: UpdateUserDto = {
        username: 'testusername',
        password: 'testpassword',
        firstName: 'testfirstName',
        lastName: 'testlastname',
      };
      jest.spyOn(usersService, 'update').mockResolvedValue(result);

      expect(await usersController.updateUser(userId, updateData)).toBe(result);
      expect(usersService.update).toHaveBeenCalledWith(userId, updateData);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user and return users deleted date and time', async () => {
      const userId = 'someId' as string;
      const result = {} as User;
      jest.spyOn(usersService, 'delete').mockResolvedValue(result);

      expect(await usersController.deleteUser(userId)).toBe(result);
      expect(usersService.delete).toHaveBeenCalledWith(userId);
    });
  });
});
