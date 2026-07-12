import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Reply } from './schemas/reply.schema';
import { CreateReplyDto } from './dto/reply.dto';
import { User } from '../common/schemas/user.schema';
import { ReviewsService } from '../reviews/reviews.service';
import { ReplyAddedEvent } from '../notifications/events/notification.events';

import { Product } from '../common/schemas/product.schema';

@Injectable()
export class RepliesService {
  constructor(
    @InjectModel(Reply.name) private readonly replyModel: Model<Reply>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly reviewsService: ReviewsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createReplyDto: CreateReplyDto, user: User): Promise<Reply> {
    // Ensure the review exists
    const review = await this.reviewsService.findById(createReplyDto.reviewId);
    
    // Fetch product to get slug for linking
    const product = await this.productModel.findById(review.productId);

    const newReply = new this.replyModel({
      reviewId: new Types.ObjectId(createReplyDto.reviewId),
      userId: user._id,
      comment: createReplyDto.comment,
    });
    const saved = await newReply.save();
    
    // Emit event with product slug for linking (e.g., /product/slug#reviews)
    this.eventEmitter.emit(
      'reply.added',
      new ReplyAddedEvent(
        saved._id as Types.ObjectId,
        review._id as Types.ObjectId,
        product?._id as Types.ObjectId,
        product?.slug || '',
        user._id as Types.ObjectId,
        user.name,
        review.userId as Types.ObjectId,
      ),
    );

    return saved.populate('userId', 'name avatar');
  }

  async findByReview(reviewId: string): Promise<Reply[]> {
    return this.replyModel
      .find({
        reviewId: new Types.ObjectId(reviewId),
        isActive: true,
      })
      .populate('userId', 'name avatar')
      .sort({ createdAt: 1 })
      .exec();
  }
}
