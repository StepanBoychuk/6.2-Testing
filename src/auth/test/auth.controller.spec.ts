import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { CreateUserDto } from '../dto/createUser.dto';
import { SignInDto } from '../dto/signIn.dto';
import { User } from 'src/users/schemas/user.schema';
import { Response } from 'express';
import { HttpException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signUp', () => {
    const userDto: CreateUserDto = {
      username: 'testusername',
      password: 'testpassword',
      firstName: 'testfirstname',
      lastName: 'testlastname',
    };

    it('should sign up a user and return the user', async () => {
      const result = { _id: 'userId', ...userDto } as unknown as User;
      jest.spyOn(authService, 'signUp').mockResolvedValue(result);

      expect(await authController.signUp(userDto)).toBe(result);
    });

    it('should throw an error if the user already exists', async () => {
      jest.spyOn(authService, 'signUp').mockImplementation(() => {
        throw new HttpException(
          'User with this username is already exist',
          400,
        );
      });

      try {
        await authController.signUp(userDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('User with this username is already exist');
      }
    });
  });

  describe('signIn', () => {
    const signInDto: SignInDto = {
      username: 'testusername',
      password: 'testpassword',
    };
    const token = 'jwt-token';
    const mockResponse = {
      set: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    it('should sign in a user and return a token in the Authorization header', async () => {
      jest.spyOn(authService, 'signIn').mockResolvedValue(token);

      await authController.signIn(signInDto, mockResponse);

      expect(mockResponse.set).toHaveBeenCalledWith(
        'Authorization',
        'Bearer ' + token,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return error if signIn fails', async () => {
      jest.spyOn(authService, 'signIn').mockImplementation(() => {
        throw new HttpException('Wrong username or password', 401);
      });
      try {
        await authController.signIn(signInDto, mockResponse);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Wrong username or password');
      }
    });
  });
});
