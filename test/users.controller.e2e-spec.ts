import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { SignInDto } from 'src/auth/dto/signIn.dto';
import { UpdateUserDto } from 'src/users/dto/updateUser.dto';
import * as request from 'supertest';

describe('UsersController (e2e)', () => {
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

  describe('/api/users (GET)', () => {
    it('should return a list of users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .expect(200);
      const { body } = response;

      expect(Array.isArray(body)).toBe(true);
      body.forEach((user) => {
        expect(user).toHaveProperty('_id');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('rating');
      });
    });
  });

  describe('/api/users/:id (GET)', () => {
    it('should return user by id', async () => {
      const userId = '60d5ecf5f9d74e30c8d59d01';
      const response = await request(app.getHttpServer())
        .get('/api/users/' + userId)
        .expect(200);
      const { body } = response;

      expect(body).toHaveProperty('_id', userId);
      expect(body).toHaveProperty('username');
      expect(body).toHaveProperty('rating');
    });

    it('should return status code 404 if user with id does not exist', async () => {
      const userId = 'wrongUserId';
      const response = await request(app.getHttpServer())
        .get('/api/users/' + userId)
        .expect(404);

      const { body } = response;

      expect(body).toHaveProperty('message', 'User not found');
    });
  });

  describe('/api/users/:id (PUT)', () => {
    const updateUserDto: UpdateUserDto = {
      username: 'newUsername',
      password: 'newPassword',
      firstName: 'newFirstName',
      lastName: 'newLastName',
    };
    it('should update users data and return status code 200 with updated user', async () => {
      const userId = '60d5ecf5f9d74e30c8d59d02'; //userForUpdateData id
      const signInDto: SignInDto = {
        username: 'userForUpdateData',
        password: 'password',
      };
      const getToken = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(200);
      const token = getToken.headers.authorization;

      const response = await request(app.getHttpServer())
        .put('/api/users/' + userId)
        .set('Authorization', token)
        .send(updateUserDto)
        .expect(200);

      const { body } = response;

      expect(body).toHaveProperty('_id', userId);
      expect(body).toHaveProperty('username', updateUserDto.username);
      expect(body).toHaveProperty('firstName', updateUserDto.firstName);
      expect(body).toHaveProperty('lastName', updateUserDto.lastName);
    });

    it('should return status code 401 if user try update not his own data', async () => {
      const wrongId = '60d5ecf5f9d74e30c8d59d01'; //id of another user
      const signInDto: SignInDto = {
        username: 'userForInvalidUpdate',
        password: 'password',
      };
      const getToken = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(200);
      const token = getToken.headers.authorization;

      const response = await request(app.getHttpServer())
        .put('/api/users/' + wrongId)
        .set('Authorization', token)
        .send(updateUserDto)
        .expect(401);

      const { body } = response;

      expect(body).toHaveProperty('message', 'Unauthorized');
    });

    it('should update another user data, if role in jwt token is admin', async () => {
      const userId = '60d5ecf5f9d74e30c8d59d02'; //userForUpdateData id
      const signInDto: SignInDto = {
        username: 'admin', //id: 60d5ecf5f9d74e30c8d59d04
        password: 'admin',
      };
      const getToken = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(200);
      const token = getToken.headers.authorization;

      const response = await request(app.getHttpServer())
        .put('/api/users/' + userId)
        .set('Authorization', token)
        .send(updateUserDto)
        .expect(200);

      const { body } = response;

      expect(body).toHaveProperty('_id', userId);
      expect(body).toHaveProperty('username', updateUserDto.username);
      expect(body).toHaveProperty('firstName', updateUserDto.firstName);
      expect(body).toHaveProperty('lastName', updateUserDto.lastName);
    });

    it('should return status code 401 if token is invalid', async () => {
      const userId = '60d5ecf5f9d74e30c8d59d02'; //userForUpdateData id
      const token = 'Invalid token';

      const response = await request(app.getHttpServer())
        .put('/api/users/' + userId)
        .set('Authorization', token)
        .send(updateUserDto)
        .expect(401);

      const { body } = response;

      expect(body).toHaveProperty('message', 'Unauthorized');
    });

    it('should return status 401 because of validation fails', async () => {
      const id = '60d5ecf5f9d74e30c8d59d03';
      const signInDto: SignInDto = {
        username: 'userForInvalidUpdate',
        password: 'password',
      };

      const invalidData: UpdateUserDto = {
        username: 'aa', //too short
        password: 'newPassord',
        firstName: 'newFirstName',
        lastName: 'newLastName',
      };

      const getToken = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(200);
      const token = getToken.headers.authorization;

      const response = await request(app.getHttpServer())
        .put('/api/users/' + id)
        .set('Authorization', token)
        .send(invalidData)
        .expect(400);

      const { body } = response;

      expect(body).toHaveProperty('message', [
        'Username must be at least 3 characters long',
      ]);
    });
  });

  describe('api/users/:id (DEL)', () => {
    it('should set soft delete users account and return delete time', async () => {
      const userId = '60d5ecf5f9d74e30c8d59d04'; // userForDelete
      const signInDto: SignInDto = {
        username: 'userForDelete',
        password: 'password',
      };

      const getToken = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(200);
      const token = getToken.headers.authorization;

      const response = await request(app.getHttpServer())
        .del('/api/users/' + userId)
        .set('Authorization', token)
        .expect(200);

      const { body } = response;

      expect(body).toHaveProperty('_id', userId);
      expect(body).toHaveProperty('deletedAt');
    });

    it('should return status 401 if user try to delete not his own account', async () => {
      const userId = '60d5ecf5f9d74e30c8d59d06'; // admin
      const signInDto: SignInDto = {
        username: 'userForInvalidDelete',
        password: 'password',
      };

      const getToken = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(200);
      const token = getToken.headers.authorization;

      const response = await request(app.getHttpServer())
        .del('/api/users/' + userId)
        .set('Authorization', token)
        .expect(401);

      const { body } = response;

      expect(body).toHaveProperty('message', 'Unauthorized');
    });
    it('user with role admin should delete another user account', async () => {
      const userId = '60d5ecf5f9d74e30c8d59d05'; // userForInvalidDelete
      const signInDto: SignInDto = {
        username: 'admin',
        password: 'admin',
      };

      const getToken = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(200);
      const token = getToken.headers.authorization;

      const response = await request(app.getHttpServer())
        .del('/api/users/' + userId)
        .set('Authorization', token)
        .expect(200);

      const { body } = response;

      expect(body).toHaveProperty('_id', userId);
      expect(body).toHaveProperty('deletedAt');
    });
  });
});
