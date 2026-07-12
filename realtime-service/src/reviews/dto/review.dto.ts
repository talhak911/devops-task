import { IsNotEmpty, IsNumber, IsString, Min, Max, IsMongoId } from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;
}

export class UpdateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  comment?: string;
}
