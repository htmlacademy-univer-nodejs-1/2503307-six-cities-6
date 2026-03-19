import { IsEmail, IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'User email is not valid' })
  public email?: string;

  @IsOptional()
  @IsString({ message: 'User avatarPath should be string' })
  public avatarPath?: string;

  @IsOptional()
  @IsString({ message: 'User firstname is required' })
  public firstname?: string;

  @IsOptional()
  @IsString({ message: 'User lastname is required' })
  public lastname?: string;
}
