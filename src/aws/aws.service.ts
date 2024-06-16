import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoode from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class AwsService {
  constructor(
    @InjectModel('User')
    private userModel: mongoode.Model<User>,
  ) {}

  s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_KEY,
    },
    region: process.env.AWS_REGION,
  });
  async getPresignedURL(userId: string, fileName: string): Promise<string> {
    const filePath = userId + '/' + fileName;
    const fileParts = fileName.split('.');
    const fileExtenshion = fileParts[fileParts.length - 1];
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: filePath,
      ContentType: `image/${fileExtenshion}`,
      ACL: 'public-read',
    });
    return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }
  async getFileUrl(filePath: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: filePath,
    });
    return await getSignedUrl(this.s3, command);
  }

  async processMessage() {
    const receiveParams = {
      QueueUrl: process.env.SQS_URL,
      MaxNumberOfMessage: 10,
      WaitTimeSeconds: 1,
      MessageAttributes: ['All'],
    };
    const sqsClient = new SQSClient({
      credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY,
      },
      region: process.env.AWS_REGION,
    });
    const receiveCommand = new ReceiveMessageCommand(receiveParams);
    const { Messages } = await sqsClient.send(receiveCommand);
    if (!Messages) return;
    Messages.forEach(async (msg) => {
      const { ReceiptHandle } = msg;
      const data = JSON.parse(msg.Body);
      const filePath = data.Records[0].s3.object.key;
      const userId = filePath.split('/')[0];
      await this.userModel.findByIdAndUpdate(
        { _id: userId },
        {
          avatarURL: await this.getFileUrl(filePath),
        },
      );
      await sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: process.env.SQS_URL,
          ReceiptHandle: ReceiptHandle,
        }),
      );
    });
  }
}
