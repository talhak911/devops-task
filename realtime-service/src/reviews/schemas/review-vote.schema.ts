import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ReviewVote extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Review', required: true, index: true })
  reviewId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const ReviewVoteSchema = SchemaFactory.createForClass(ReviewVote);
