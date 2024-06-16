import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { SignInDto } from 'src/auth/dto/signIn.dto';
import { VoteDto } from 'src/vote/dto/vote.dto';
import * as request from 'supertest';

describe('VoteController (e2e)', () => {
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

  describe('api/users/vote (POST)', () => {
    it('should create new vote', async () => {
      const userId = '60d5ecf5f9d74e30c8d59d08'; //userForVote

      const signInDto: SignInDto = {
        username: 'userWhoVote',
        password: 'password',
      };

      const voteDto: VoteDto = {
        targetUser: userId,
        voteType: 1,
      };

      const getToken = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(200);

      const token = getToken.headers.authorization;

      const response = await request(app.getHttpServer())
        .post('/api/users/vote')
        .set('Authorization', token)
        .send(voteDto)
        .expect(201);

      const { body } = response;

      expect(body).toHaveProperty('targetUser', voteDto.targetUser);
      expect(body).toHaveProperty('voteType', voteDto.voteType);
    });

    it('should status code 429 if user alreadt voted in the last hour', async () => {
      const userId = '60d5ecf5f9d74e30c8d59d08'; //userForVote

      const signInDto: SignInDto = {
        username: 'userWhoVote',
        password: 'password',
      };

      const voteDto: VoteDto = {
        targetUser: userId,
        voteType: 1,
      };

      const getToken = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(200);

      const token = getToken.headers.authorization;

      const response = await request(app.getHttpServer())
        .post('/api/users/vote')
        .set('Authorization', token)
        .send(voteDto)
        .expect(429);

      const { body } = response;

      expect(body).toHaveProperty('message', 'You can vote once per hour');
    });

    it('should return status code 400 if user try to vote for himself', async () => {
      const userId = '60d5ecf5f9d74e30c8d59d09'; //userWhoVote2

      const voteDto: VoteDto = {
        targetUser: userId,
        voteType: 1,
      };

      const signInDto: SignInDto = {
        username: 'userWhoVote2',
        password: 'password',
      };

      const getToken = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(200);

      const token = getToken.headers.authorization;

      const response = await request(app.getHttpServer())
        .post('/api/users/vote')
        .set('Authorization', token)
        .send(voteDto)
        .expect(400);

      const { body } = response;

      expect(body).toHaveProperty('message', 'You cannot vote for yourself');
    });

    it('should return status code 400 if targetUser id is incorrect', async () => {
      const userId = 'wrong user id';

      const signInDto: SignInDto = {
        username: 'userWhoVote2',
        password: 'password',
      };

      const voteDto: VoteDto = {
        targetUser: userId,
        voteType: 1,
      };
      const getToken = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(200);

      const token = getToken.headers.authorization;

      const response = await request(app.getHttpServer())
        .post('/api/users/vote')
        .set('Authorization', token)
        .send(voteDto)
        .expect(400);

      const { body } = response;

      expect(body).toHaveProperty('message', ['Wrong target user id']);
    });

    it('should return status code 400 if voteType is incorrect', async () => {
      const userId = '60d5ecf5f9d74e30c8d59d08';

      const signInDto: SignInDto = {
        username: 'userWhoVote2',
        password: 'password',
      };

      const voteDto: VoteDto = {
        targetUser: userId,
        voteType: 2,
      };
      const getToken = await request(app.getHttpServer())
        .post('/api/users/signin')
        .send(signInDto)
        .expect(200);

      const token = getToken.headers.authorization;

      const response = await request(app.getHttpServer())
        .post('/api/users/vote')
        .set('Authorization', token)
        .send(voteDto)
        .expect(400);

      const { body } = response;

      expect(body).toHaveProperty('message', [
        'voteType must be one of the following values: -1, 1',
      ]);
    });
  });
});
