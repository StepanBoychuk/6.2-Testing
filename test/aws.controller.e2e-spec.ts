import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';
import { SignInDto } from 'src/auth/dto/signIn.dto';
import { AvatarDto } from 'src/aws/dto/avatarUpload.dto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/s3-request-presigner');

describe('AwsController (e2e)', () => {
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

  describe('/api/users/avatar (POST)', () => {
    it('should return presigned URL to upload avatar to s3 bucket', async () => {
      const mockUrl = 'https://url-to-upload-file.com';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);
      const avatarDto: AvatarDto = {
        fileName: 'testAvatar.jpg',
      };
      const signInDto: SignInDto = {
        username: 'userForAvatarUpload',
        password: 'password',
      };

      const getToken = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(200);

      const token = getToken.headers.authorization;

      const response = await request(app.getHttpServer())
        .post('/api/users/avatar')
        .set('Authorization', token)
        .send(avatarDto)
        .expect(201);

      expect(response.text).toBe(mockUrl);
    });

    it('should return status code 401 if wrong or no token or wrong token provided', async () => {
      const token = 'wrongJWTtoken';

      const avatarDto: AvatarDto = {
        fileName: 'avatar.jpg',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users/avatar')
        .set('Authorization', token)
        .send(avatarDto)
        .expect(401);

      const { body } = response;

      expect(body).toHaveProperty('message', 'Unauthorized');
    });

    it('should return status code 400 if user try to get link to file with invalid extenshion', async () => {
      const avatarDto: AvatarDto = {
        fileName: 'testAvatar.exe',
      };
      const signInDto: SignInDto = {
        username: 'userForAvatarUpload',
        password: 'password',
      };

      const getToken = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(200);

      const token = getToken.headers.authorization;

      const response = await request(app.getHttpServer())
        .post('/api/users/avatar')
        .set('Authorization', token)
        .send(avatarDto)
        .expect(400);

      const { body } = response;

      expect(body).toHaveProperty('message', [
        'File name must have a valid image extension (.jpg, .jpeg, .png, .bmp)',
      ]);
    });

    it('should return status code 400 if user did not provide fileName', async () => {
      const signInDto: SignInDto = {
        username: 'userForAvatarUpload',
        password: 'password',
      };

      const getToken = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(200);

      const token = getToken.headers.authorization;

      const response = await request(app.getHttpServer())
        .post('/api/users/avatar')
        .set('Authorization', token)
        .expect(400);

      const { body } = response;
      expect(body).toHaveProperty('message', [
        'File name must have a valid image extension (.jpg, .jpeg, .png, .bmp)',
        'fileName should not be empty',
        'fileName must be a string',
      ]);
    });
  });
});
