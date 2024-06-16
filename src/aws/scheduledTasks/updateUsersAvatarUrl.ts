import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AwsService } from '../aws.service';

@Injectable()
export class UpdateUsersAvatarUrl {
  constructor(private awsService: AwsService) {}
  @Cron(CronExpression.EVERY_10_SECONDS)
  async updateAvatarUrl() {
    await this.awsService.processMessage();
  }
}
