import { VoteService } from '../vote.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

describe('VoteService', () => {
  let voteService: VoteService;
  const mockVoteModel = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoteService,
        {
          provide: getModelToken('Vote'),
          useValue: mockVoteModel,
        },
      ],
    }).compile();

    voteService = module.get<VoteService>(VoteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(voteService).toBeDefined();
  });

  describe('vote', () => {
    it('should create new vote if it does not exist', async () => {
      const newVote = {
        user: 'userId',
        targetUser: 'targetUserId',
        voteType: 1,
      };
      mockVoteModel.findOne.mockResolvedValue(null);
      mockVoteModel.create.mockImplementation(() => newVote);

      const result = await voteService.vote('userId', 'targetUserId', 1);

      expect(mockVoteModel.findOne).toHaveBeenCalledWith({
        user: 'userId',
        targetUser: 'targetUserId',
      });
      expect(result).toEqual(newVote);
    });

    it('should update existed vote if it exist and set voteType to 0 if same voteType', async () => {
      const existingVote = {
        user: 'userId',
        targetUser: 'targetUserId',
        voteType: 1,
        save: jest.fn().mockResolvedValue({ voteType: 0 }),
      };
      mockVoteModel.findOne.mockResolvedValue(existingVote);

      const result = await voteService.vote('userId', 'targetUserId', 1);

      expect(result.voteType).toEqual(0);
      expect(existingVote.save).toHaveBeenCalled();
    });

    it('should update existing vote with new voteType if different voteType provided', async () => {
      const existingVote = {
        user: 'userId',
        targetUser: 'targetUserId',
        voteType: 1,
        save: jest.fn().mockResolvedValue({ voteType: -1 }),
      };
      mockVoteModel.findOne.mockResolvedValue(existingVote);
      const result = await voteService.vote('userId', 'targetUserId', -1);

      expect(result.voteType).toEqual(-1);
      expect(existingVote.save).toHaveBeenCalled();
    });
  });

  describe('canVote', () => {
    it('should return true if user can vote', async () => {
      mockVoteModel.findOne.mockResolvedValue(null);

      const result = await voteService.canVote('userId');

      expect(result).toEqual(true);
      expect(mockVoteModel.findOne).toHaveBeenCalledWith({
        user: 'userId',
        updatedAt: { $gt: expect.any(Date) },
      });
    });

    it('should return false if user cannot vote', async () => {
      mockVoteModel.findOne.mockResolvedValue({});

      const result = await voteService.canVote('userId');

      expect(result).toEqual(false);
      expect(mockVoteModel.findOne).toHaveBeenCalledWith({
        user: 'userId',
        updatedAt: { $gt: expect.any(Date) },
      });
    });
  });
});
