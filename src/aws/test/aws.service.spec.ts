import { Test, TestingModule } from '@nestjs/testing';
import { AwsService } from '../aws.service';
import { getModelToken } from '@nestjs/mongoose';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ReceiveMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/client-sqs');

const mockUserModel = {
  findByIdAndUpdate: jest.fn(),
};

describe('AwsService', () => {
  let awsService: AwsService;
  let userModel: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AwsService,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    awsService = module.get<AwsService>(AwsService);
    userModel = module.get<Model<User>>(getModelToken('User'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(AwsService).toBeDefined();
  });

  describe('getPresignedURL', () => {
    it('should return pre signed Url', async () => {
      const mockUrl = 'https://example.com/testfile.jpg';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

      const result = await awsService.getPresignedURL('userId', 'testfile.jpg');

      expect(result).toBe(mockUrl);
      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(PutObjectCommand),
        { expiresIn: 3600 },
      );
    });
  });

  describe('getFileUrl', () => {
    it('should return file Url', async () => {
      const mockUrl = 'https://example.com';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

      const result = await awsService.getFileUrl('userId/testfile.jpg');

      expect(result).toEqual(mockUrl);
      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(GetObjectCommand),
      );
    });
  });

  describe('processMessage', () => {
    it('should process messages from SQS queue', async () => {
      const mockMessage = {
        Body: JSON.stringify({
          Records: [
            {
              s3: {
                object: {
                  key: 'userId/testfile.jpg',
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
      jest
        .spyOn(awsService, 'getFileUrl')
        .mockResolvedValue('userId/testfile.jpg');
      (userModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({});
      await awsService.processMessage();

      expect(SQSClient.prototype.send).toHaveBeenCalledWith(
        expect.any(ReceiveMessageCommand),
      );
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: 'userId' },
        { avatarURL: 'userId/testfile.jpg' },
      );
    });
  });
});
