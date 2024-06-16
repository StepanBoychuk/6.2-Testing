import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
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

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'First name must be at least 3 characters long' })
  @MaxLength(20, { message: 'First name must be less than 20 characters long' })
  firstName: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Last name must be at least 3 characters long' })
  @MaxLength(20, { message: 'Last name must be less than 20 characters long' })
  lastName: string;
}
