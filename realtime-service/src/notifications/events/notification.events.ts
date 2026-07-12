import { Types } from 'mongoose';

export class ReviewCreatedEvent {
  constructor(
    public readonly reviewId: Types.ObjectId,
    public readonly productId: Types.ObjectId,
    public readonly productName: string,
    public readonly productSlug: string,
    public readonly userId: Types.ObjectId,
    public readonly userName: string,
    public readonly rating: number,
  ) {}
}

export class ReplyAddedEvent {
  constructor(
    public readonly replyId: Types.ObjectId,
    public readonly reviewId: Types.ObjectId,
    public readonly productId: Types.ObjectId,
    public readonly productSlug: string,
    public readonly userId: Types.ObjectId,
    public readonly userName: string,
    public readonly reviewOwnerId: Types.ObjectId,
  ) {}
}

export class ReviewLikedEvent {
  constructor(
    public readonly reviewId: Types.ObjectId,
    public readonly actorId: Types.ObjectId,
    public readonly actorName: string,
    public readonly reviewOwnerId: Types.ObjectId,
    public readonly productId: Types.ObjectId,
    public readonly productSlug?: string,
  ) {}
}

export class ReviewDeletedEvent {
  constructor(
    public readonly reviewOwnerId: Types.ObjectId,
    public readonly productId: Types.ObjectId,
    public readonly productSlug: string,
    public readonly adminName: string,
  ) {}
}
