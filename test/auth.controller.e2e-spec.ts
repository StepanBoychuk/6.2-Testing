import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { CreateUserDto } from 'src/auth/dto/createUser.dto';
import { SignInDto } from 'src/auth/dto/signIn.dto';
import * as request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/users/signup (POST)', () => {
    it('should create new user and return status code 200 and new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'test',
        password: 'test',
        firstName: 'test',
        lastName: 'test',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users/signup')
        .send(createUserDto)
        .expect(201);

      const { body } = response;

      expect(body).toHaveProperty('_id');
      expect(body).toHaveProperty('username', 'test');
      expect(body).toHaveProperty('firstName', 'test');
      expect(body).toHaveProperty('lastName', 'test');
    });

    it('should return status code 400, because user is already exist', async () => {
      const createUserDto: CreateUserDto = {
        username: 'userForSignIn',
        password: 'testpassword',
        firstName: 'testName',
        lastName: 'testName',
      };
      const response = await request(app.getHttpServer())
        .post('/api/users/signup')
        .send(createUserDto)
        .expect(400);

      const { body } = response;

      expect(body).toHaveProperty(
        'message',
        'User with this username is already exist',
      );
    });

    it('should return status code 400, because of short username', async () => {
      const createUserDto: CreateUserDto = {
        username: 'te', //username should be at least 3 characters long
        password: 'test',
        firstName: 'test',
        lastName: 'test',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users/signup')
        .send(createUserDto)
        .expect(400);

      const { body } = response;
      expect(body).toHaveProperty('message', [
        'Username must be at least 3 characters long',
      ]);
    });

    it('should return status code 400, because of wrong characters', async () => {
      const createUserDto: CreateUserDto = {
        username: 'test!!', //username can only contain letters and numbers
        password: 'test',
        firstName: 'test',
        lastName: 'test',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users/signup')
        .send(createUserDto)
        .expect(400);

      const { body } = response;
      expect(body).toHaveProperty('message', [
        'Username can only contain letters and numbers',
      ]);
    });
  });

  describe('/api/users/signin (POST)', () => {
    it('should return status 200 and set Authorization header', async () => {
      const signInDto: SignInDto = {
        username: 'userForSignIn',
        password: 'password',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(200);

      expect(response.header['authorization']).toMatch(/^Bearer\s.+/);
    });

    it('should return status 401 because of wrong username', async () => {
      const signInDto: SignInDto = {
        username: 'nonExistingUser',
        password: 'password',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(401);

      const { body } = response;
      expect(body).toHaveProperty('message', 'Wrong username or password');
    });

    it('should return status 401 because of wrong password', async () => {
      const signInDto: SignInDto = {
        username: 'user1',
        password: 'wrongPassword',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(401);

      const { body } = response;
      expect(body).toHaveProperty('message', 'Wrong username or password');
    });

    it('should return status 400 because of validation fails', async () => {
      const signInDto: SignInDto = {
        username: 'user1!!', //username can only contain letters and numbers
        password: 'password',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(400);

      const { body } = response;
      expect(body).toHaveProperty('message', [
        'Username can only contain letters and numbers',
      ]);
    });
  });
});
