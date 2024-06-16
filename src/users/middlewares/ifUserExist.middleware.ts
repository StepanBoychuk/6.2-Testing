import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import * as mongoose from 'mongoose';

@Injectable()
export class IfUserExistMiddleware implements NestMiddleware {
  async use(req: any, res: any, next: NextFunction) {
    const isValid = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!isValid) throw new HttpException('User not found', 404);
    next();
  }
}
