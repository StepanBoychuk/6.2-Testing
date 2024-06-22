import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class AvatarDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\.(jpg|jpeg|png|bmp)$/i, {
    message:
      'File name must have a valid image extension (.jpg, .jpeg, .png, .bmp)',
  })
  fileName: string;
}
