import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { SignInDto } from 'src/auth/dto/signIn.dto';
import { VoteDto } from 'src/vote/dto/vote.dto';
import * as request from 'supertest';

jest.setTimeout(20000); // 20 seconds

describe('VoteController (e2e)', () => {
  let app: INestApplication;
  //create variables for all needed JWT tokens
  let userWhoVoteToken: string;
  let userWhoVote2Token: string;

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
    //get all needed JWT tokens
    const userWhoVoteDto: SignInDto = {
      username: 'userWhoVote',
      password: 'password',
    };
    const userWhoVote2Dto: SignInDto = {
      username: 'userWhoVote2',
      password: 'password',
    };

    const getUserWhoVoteToken = await request(app.getHttpServer())
      .post('/api/users/signin')
      .send(userWhoVoteDto)
      .expect(200);
    const getUserWhoVote2Token = await request(app.getHttpServer())
      .post('/api/users/signin')
      .send(userWhoVote2Dto)
      .expect(200);

    userWhoVoteToken = getUserWhoVoteToken.headers.authorization;
    userWhoVote2Token = getUserWhoVote2Token.headers.authorization;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('api/users/vote (POST)', () => {
    it('should create new vote and update users rating', async () => {
      const userId = '60d5ecf5f9d74e30c8d59d08'; //userForVote

      const voteDto: VoteDto = {
        targetUser: userId,
        voteType: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/api/users/vote')
        .set('Authorization', userWhoVoteToken)
        .send(voteDto)
        .expect(201);

      const { body } = response;

      await delay(15000);

      const checkIfRatingUpdated = await request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(body).toHaveProperty('targetUser', voteDto.targetUser);
      expect(body).toHaveProperty('voteType', voteDto.voteType);
      expect(checkIfRatingUpdated.body.rating).toBe(1);
    });

    it('should status code 429 if user alreadt voted in the last hour', async () => {
      const userId = '60d5ecf5f9d74e30c8d59d08'; //userForVote

      const voteDto: VoteDto = {
        targetUser: userId,
        voteType: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/api/users/vote')
        .set('Authorization', userWhoVoteToken)
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

      const response = await request(app.getHttpServer())
        .post('/api/users/vote')
        .set('Authorization', userWhoVote2Token)
        .send(voteDto)
        .expect(400);

      const { body } = response;

      expect(body).toHaveProperty('message', 'You cannot vote for yourself');
    });

    it('should return status code 400 if targetUser id is incorrect', async () => {
      const userId = 'wrong user id';

      const voteDto: VoteDto = {
        targetUser: userId,
        voteType: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/api/users/vote')
        .set('Authorization', userWhoVote2Token)
        .send(voteDto)
        .expect(400);

      const { body } = response;

      expect(body).toHaveProperty('message', ['Wrong target user id']);
    });

    it('should return status code 400 if voteType is incorrect', async () => {
      const userId = '60d5ecf5f9d74e30c8d59d08';

      const voteDto: VoteDto = {
        targetUser: userId,
        voteType: 2,
      };

      const response = await request(app.getHttpServer())
        .post('/api/users/vote')
        .set('Authorization', userWhoVote2Token)
        .send(voteDto)
        .expect(400);

      const { body } = response;

      expect(body).toHaveProperty('message', [
        'voteType must be one of the following values: -1, 1',
      ]);
    });
  });
});
