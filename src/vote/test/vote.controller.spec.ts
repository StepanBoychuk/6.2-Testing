import { Test, TestingModule } from '@nestjs/testing';
import { VoteController } from '../vote.controller';
import { VoteService } from '../vote.service';
import { VoteDto } from '../dto/vote.dto';
import { Vote } from '../schemas/vote.schema';

describe('VoteController', () => {
  let voteController: VoteController;
  let voteService: VoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoteController],
      providers: [
        {
          provide: VoteService,
          useValue: {
            vote: jest.fn(),
            canVote: jest.fn(),
          },
        },
      ],
    }).compile();

    voteController = module.get<VoteController>(VoteController);
    voteService = module.get<VoteService>(VoteService);
  });

  it('should be defined', () => {
    expect(voteController).toBeDefined();
  });

  describe('vote', () => {
    const mockUser = {
      id: 'someId',
      username: 'testusername',
    } as any;
    const voteDto: VoteDto = {
      targetUser: 'targetUserId',
      voteType: 1,
    };
    const result = {
      _id: 'voteId',
      user: mockUser.id,
      ...voteDto,
    } as unknown as Vote;
    it('create or edit vote and return vote', async () => {
      jest.spyOn(voteService, 'vote').mockImplementation(() => result as any);
      expect(await voteController.vote(voteDto, mockUser)).toBe(result);
      expect(voteService.vote).toHaveBeenCalledWith(
        mockUser.id,
        voteDto.targetUser,
        voteDto.voteType,
      );
    });
  });
});
