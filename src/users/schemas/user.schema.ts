import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import { HashService } from 'src/hash/hash.service';

const hashService = new HashService();
@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  avatarURL: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ enum: ['user', 'moderator', 'admin'], default: 'user' })
  role: string;

  @Prop({ default: null })
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next: NextFunction) {
  if (this.password) {
    this.password = await hashService.hashPassword(this.password);
  }
  next();
});

UserSchema.pre('findOneAndUpdate', async function (next: NextFunction) {
  const update: any = this.getUpdate();
  if (update.password) {
    const hashedPassword = await hashService.hashPassword(update.password);
    update.password = hashedPassword;
  }
  next();
});

UserSchema.pre('find', async function (next: NextFunction) {
  this.where({ deletedAt: null });
  next();
});

UserSchema.pre('findOne', async function (next: NextFunction) {
  this.where({ deletedAt: null });
  next();
});
