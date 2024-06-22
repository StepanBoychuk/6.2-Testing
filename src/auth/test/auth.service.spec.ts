import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { HashService } from 'src/hash/hash.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import { HttpException } from '@nestjs/common';
import { CreateUserDto } from '../dto/createUser.dto';
import { SignInDto } from '../dto/signIn.dto';

const mockUserModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockHashService = {
  hashPassword: jest.fn(),
};

const mockUser = {
  id: 1,
  username: 'user',
  password: 'hashedpassword',
  role: 'user',
};

describe('AuthService', () => {
  let authService: AuthService;
  let userModel: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: HashService,
          useValue: mockHashService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken('User'));
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signup', () => {
    const createUserDto: CreateUserDto = {
      username: 'testusername',
      password: 'testpassword',
      firstName: 'testfirstname',
      lastName: 'testlastname',
    };
    it('should throw an exeption if username is already taken', async () => {
      mockUserModel.findOne.mockResolvedValue({});
      await expect(authService.signUp(createUserDto)).rejects.toThrow(
        new HttpException('User with this username is already exist', 400),
      );
      expect(userModel.findOne).toHaveBeenCalledWith({
        username: createUserDto.username,
      });
    });
    it('should create new user and return the user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue(createUserDto);

      const result = await authService.signUp(createUserDto);

      expect(result).toEqual(createUserDto);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        username: createUserDto.username,
      });
      expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('signin', () => {
    const signInDto: SignInDto = {
      username: 'user',
      password: 'password',
    };
    it('should throw an exeption if user does not exist', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        new HttpException('Wrong username or password', 401),
      );
    });

    it('should throw an exeption if password is incorrect', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockHashService.hashPassword.mockResolvedValue('wronghashedpassword');

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        new HttpException('Wrong username or password', 401),
      );
    });
    it('should return signed JWT token', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockHashService.hashPassword.mockResolvedValue('hashedpassword');
      mockJwtService.sign.mockResolvedValue('jwt-token');

      const result = await authService.signIn(signInDto);
      expect(result).toEqual('jwt-token');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      });
    });
  });
});
