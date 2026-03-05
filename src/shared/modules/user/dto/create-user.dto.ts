import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'User email is not valid' })
  public email!: string;

  @IsString({ message: 'User firstname is required' })
  @MinLength(1, { message: 'Min length is 1' })
  @MaxLength(50, { message: 'Max length is 50' })
  public firstname!: string;

  @IsString({ message: 'User lastname is required' })
  @MinLength(1, { message: 'Min length is 1' })
  @MaxLength(50, { message: 'Max length is 50' })
  public lastname!: string;

  @IsString({ message: 'User password is required' })
  @MinLength(6, { message: 'Min length is 6' })
  @MaxLength(12, { message: 'Max length is 12' })
  public password!: string;

  @IsOptional()
  @IsString({ message: 'User avatarPath should be string' })
  public avatarPath?: string;
}
