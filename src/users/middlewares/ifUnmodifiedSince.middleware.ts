import {
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
  PreconditionFailedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users.service';

@Injectable()
export class IfUnmodifiedSinceMiddleware implements NestMiddleware {
  constructor(private readonly userService: UsersService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const ifUnmodifiedSince = new Date(req.headers['if-unmodified-since']);
      const user: any = await this.userService.findOneById(req.params.id);
      if (ifUnmodifiedSince && ifUnmodifiedSince > user.updatedAt) {
        throw new PreconditionFailedException();
      }
      next();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
