import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsObject, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { OfferType } from '../../../types/index.js';

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  @Length(10, 100)
  public title?: string;

  @IsOptional()
  @IsString()
  @Length(20, 1024)
  public description?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public postDate?: Date;

  @IsOptional()
  @IsString()
  public city?: string;

  @IsOptional()
  @IsString()
  public previewImage?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  public images?: string[];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  public isPremium?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  public isFavorite?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  public rating?: number;

  @IsOptional()
  @IsEnum(OfferType)
  public type?: OfferType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(8)
  public rooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  public guests?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @Max(100000)
  public price?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public goods?: string[];

  @IsOptional()
  @IsObject()
  public location?: {
    latitude: number;
    longitude: number;
  };
}
