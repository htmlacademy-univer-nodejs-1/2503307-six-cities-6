import { Type } from 'class-transformer';
import { IsString, IsDate, IsBoolean, IsNumber, IsEnum, IsArray, Min, Max, Length, ArrayMinSize, ArrayMaxSize, IsMongoId, IsObject, IsOptional } from 'class-validator';
import { OfferType } from '../../../types/index.js';

export class CreateOfferDto {
  @IsString()
  @Length(10, 100)
  public title!: string;

  @IsString()
  @Length(20, 1024)
  public description!: string;

  @Type(() => Date)
  @IsDate()
  public postDate!: Date;

  @IsString()
  public city!: string;

  @IsString()
  public previewImage!: string;

  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  public images!: string[];

  @Type(() => Boolean)
  @IsBoolean()
  public isPremium!: boolean;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  public rating!: number;

  @IsEnum(OfferType)
  public type!: OfferType;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(8)
  public rooms!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  public guests!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @Max(100000)
  public price!: number;

  @IsArray()
  @IsString({ each: true })
  public goods!: string[];

  @IsOptional()
  @IsMongoId()
  public authorId?: string;

  @IsObject()
  public location!: {
    latitude: number;
    longitude: number;
  };
}
