import { Test, TestingModule } from '@nestjs/testing';
import { AwsController } from '../aws.controller';
import { AwsService } from '../aws.service';
import { AvatarDto } from '../dto/avatarUpload.dto';

describe('AwsController', () => {
  let awsController: AwsController;
  let awsService: AwsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AwsController],
      providers: [
        {
          provide: AwsService,
          useValue: {
            getPresignedURL: jest.fn(),
          },
        },
      ],
    }).compile();

    awsController = module.get<AwsController>(AwsController);
    awsService = module.get<AwsService>(AwsService);
  });

  it('should be defined', () => {
    expect(awsController).toBeDefined();
  });

  describe('getLink', () => {
    it('should return presigned URL for file uploading', async () => {
      const mockUser = {
        id: 'someId',
        username: 'testUsername',
      } as any;
      const result = 'URLforfileupload' as string;
      const avatarDto: AvatarDto = {
        fileName: 'testfilename.jpeg',
      };
      jest.spyOn(awsService, 'getPresignedURL').mockResolvedValue(result);
      expect(await awsController.getLink(avatarDto, mockUser)).toBe(result);
      expect(awsService.getPresignedURL).toHaveBeenCalledWith(
        mockUser.id,
        avatarDto.fileName,
      );
    });
  });
});
