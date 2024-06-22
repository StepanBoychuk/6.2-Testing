import { Test, TestingModule } from '@nestjs/testing';
import { HashService } from '../hash.service';
import * as crypto from 'crypto';

describe('HashService', () => {
  let hashService: HashService;
  let pbkdf2Spy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashService],
    }).compile();

    hashService = module.get<HashService>(HashService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (pbkdf2Spy) {
      pbkdf2Spy.mockRestore();
    }
  });

  it('should be defined', async () => {
    expect(hashService).toBeDefined();
  });

  describe('hashPassword', () => {
    const mockPassword = 'testpassword';
    const mockSalt = 'testsalt';
    process.env.PASSWORD_SALT = mockSalt;
    it('should hash password correctly', async () => {
      const mockDerivedKey = Buffer.from('mockedhash', 'utf-8');

      pbkdf2Spy = jest
        .spyOn(crypto, 'pbkdf2')
        .mockImplementation(
          (password, salt, iterations, keylen, digest, callback) => {
            callback(null, mockDerivedKey);
          },
        );
      const result = await hashService.hashPassword(mockPassword);

      expect(result).toEqual(mockDerivedKey.toString('hex'));
    });

    it('should return an error if hashing fails', async () => {
      const mockError = new Error('Hashing failed');

      pbkdf2Spy = jest
        .spyOn(crypto, 'pbkdf2')
        .mockImplementation(
          (password, salt, iterations, keylen, digest, callback) => {
            callback(mockError, null);
          },
        );
      await expect(hashService.hashPassword(mockPassword)).rejects.toThrow(
        'Hashing failed',
      );
    });
  });
});
