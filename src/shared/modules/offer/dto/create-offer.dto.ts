import { IsString, MinLength, MaxLength, IsDateString, IsEnum, IsInt, Min, Max, IsArray, IsMongoId } from 'class-validator';
import { OfferType } from '../../../types/index.js';

export class CreateOfferDto {
  @IsString({ message: 'Offer title is required' })
  @MinLength(10, { message: 'Min length is 10' })
  @MaxLength(100, { message: 'Max length is 100' })
  public title!: string;

  @IsString({ message: 'Offer description is required' })
  @MinLength(20, { message: 'Min length is 20' })
  @MaxLength(1024, { message: 'Max length is 1024' })
  public description!: string;

  @IsDateString({}, { message: 'postDate must be valid ISO 8601 date' })
  public postDate!: Date;

  @IsEnum(OfferType, { message: 'Offer type is not valid' })
  public type!: OfferType;

  @IsInt({ message: 'Price must be integer' })
  @Min(100, { message: 'Min price is 100' })
  @Max(200000, { message: 'Max price is 200000' })
  public price!: number;

  @IsArray({ message: 'Categories must be array' })
  @IsMongoId({ each: true, message: 'Category id must be valid mongo id' })
  public categories!: string[];

  @IsString({ message: 'Offer image is required' })
  public image!: string;

  public userId?: string;
}
