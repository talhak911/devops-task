import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true, default: null })
  recipientId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  actorId: Types.ObjectId;

  @Prop({ required: true })
  type: string; // REVIEW_CREATED, REPLY_ADDED, LIKE_ADDED

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Types.ObjectId, required: true })
  relatedId: Types.ObjectId; // Review ID or Reply ID

  @Prop()
  link: string; // Target URL for frontend navigation (e.g., /product/slug#reviews)

  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
