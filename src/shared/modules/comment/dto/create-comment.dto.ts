import { IsString, IsNumber, Min, Max, IsMongoId } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  public text!: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  public rating!: number;

  @IsMongoId()
  public offerId!: string;

  @IsMongoId()
  public userId!: string;
}
