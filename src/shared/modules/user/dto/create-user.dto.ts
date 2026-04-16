import { IsEmail, IsIn, IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'email must be valid email address' })
  public email!: string;

  @IsOptional()
  @IsString({ message: 'avatarPath must be a string' })
  public avatarPath?: string;

  @IsString({ message: 'firstname must be a string' })
  @Length(1, 15, { message: 'firstname length must be between 1 and 15 characters' })
  public firstname!: string;

  @IsString({ message: 'lastname must be a string' })
  @Length(1, 15, { message: 'lastname length must be between 1 and 15 characters' })
  public lastname!: string;

  @IsString({ message: 'password must be a string' })
  @MinLength(6, { message: 'password must be at least 6 characters' })
  @MaxLength(12, { message: 'password must be at most 12 characters' })
  public password!: string;

  @IsIn(['ordinary', 'pro'], { message: 'userType must be one of: ordinary, pro' })
  public userType!: 'ordinary' | 'pro';
}
