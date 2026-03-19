import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Category name is required' })
  @MinLength(3, { message: 'Min length is 3' })
  @MaxLength(100, { message: 'Max length is 100' })
  public name!: string;

  @IsString({ message: 'Category image is required' })
  public image!: string;
}
