import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreateReplyDto {
  @IsMongoId()
  @IsNotEmpty()
  reviewId: string;

  @IsString()
  @IsNotEmpty()
  comment: string;
}
