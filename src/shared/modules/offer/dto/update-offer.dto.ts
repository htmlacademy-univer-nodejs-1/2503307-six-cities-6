import { IsString, MinLength, MaxLength, IsDateString, IsEnum, IsInt, Min, Max, IsArray, IsMongoId, IsOptional } from 'class-validator';
import { OfferType } from '../../../types/index.js';

export class UpdateOfferDto {
  @IsOptional()
  @IsString({ message: 'Offer title is required' })
  @MinLength(10, { message: 'Min length is 10' })
  @MaxLength(100, { message: 'Max length is 100' })
  public title?: string;

  @IsOptional()
  @IsString({ message: 'Offer description is required' })
  @MinLength(20, { message: 'Min length is 20' })
  @MaxLength(1024, { message: 'Max length is 1024' })
  public description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'postDate must be valid ISO 8601 date' })
  public postDate?: Date;

  @IsOptional()
  @IsEnum(OfferType, { message: 'Offer type is not valid' })
  public type?: OfferType;

  @IsOptional()
  @IsInt({ message: 'Price must be integer' })
  @Min(100, { message: 'Min price is 100' })
  @Max(200000, { message: 'Max price is 200000' })
  public price?: number;

  @IsOptional()
  @IsArray({ message: 'Categories must be array' })
  @IsMongoId({ each: true, message: 'Category id must be valid mongo id' })
  public categories?: string[];

  @IsOptional()
  @IsString({ message: 'Offer image is required' })
  public image?: string;
}
