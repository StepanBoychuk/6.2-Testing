import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(20, { message: 'Username must be less than 20 characters long' })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'Username can only contain letters and numbers',
  })
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'Password must be at least 3 characters long' })
  password: string;
}
