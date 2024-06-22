import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';
import { SignInDto } from 'src/auth/dto/signIn.dto';
import { AvatarDto } from 'src/aws/dto/avatarUpload.dto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ReceiveMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('@aws-sdk/client-sqs');

jest.setTimeout(20000); // 20 seconds

describe('AwsController (e2e)', () => {
  let app: INestApplication;
  //create variables for all needed JWT tokens
  let userForAvatarUploadToken: string;

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  beforeAll(async () => {
    const userForAvatarUploadDto: SignInDto = {
      username: 'userForAvatarUpload',
      password: 'password',
    };

    const getUserForAvatarUploadToken = await request(app.getHttpServer())
      .post('/api/users/signin')
      .send(userForAvatarUploadDto)
      .expect(200);

    userForAvatarUploadToken =
      getUserForAvatarUploadToken.headers.authorization;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('/api/users/avatar (POST)', () => {
    it('should return presigned URL to upload avatar to s3 bucket', async () => {
      const mockUrl = 'https://url_to_upload_file.com';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);
      const avatarDto: AvatarDto = {
        fileName: 'testAvatar.jpg',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users/avatar')
        .set('Authorization', userForAvatarUploadToken)
        .send(avatarDto)
        .expect(201);

      expect(response.text).toBe(mockUrl);
    });

    it('should update avatarURL field after uploading avatar to s3 bucket', async () => {
      const userId = '60d5ecf5f9d74e30c8d59d10'; //userForAvatarUpload id
      const mockUrl = 'https://url_to_get_file.com';

      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);
      const mockMessage = {
        Body: JSON.stringify({
          Records: [
            {
              s3: {
                object: {
                  key: `${userId}/avatar.jpg`,
                },
              },
            },
          ],
        }),
        ReceiptHandle: 'mockReceiptHandle',
      };

      const mockMessages = {
        Messages: [mockMessage],
      };

      const sqsClientSendMock = jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve(mockMessages))
        .mockImplementationOnce(() => Promise.resolve());
      (SQSClient.prototype.send as jest.Mock) = sqsClientSendMock;

      await delay(15000);
      const userForAvatarUploadData = await request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(userForAvatarUploadData.body.avatarURL).toBe(mockUrl);
    });

    it('should return status code 401 if wrong or no token or wrong token provided', async () => {
      const wrongToken = 'wrongJWTtoken';

      const avatarDto: AvatarDto = {
        fileName: 'avatar.jpg',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users/avatar')
        .set('Authorization', wrongToken)
        .send(avatarDto)
        .expect(401);

      const { body } = response;

      expect(body).toHaveProperty('message', 'Unauthorized');
    });

    it('should return status code 400 if user try to get link to file with invalid extenshion', async () => {
      const avatarDto: AvatarDto = {
        fileName: 'testAvatar.exe',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users/avatar')
        .set('Authorization', userForAvatarUploadToken)
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
