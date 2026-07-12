import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Review } from './schemas/review.schema';
import { CreateReviewDto } from './dto/review.dto';
import { User } from '../common/schemas/user.schema';
import { ReviewCreatedEvent, ReviewLikedEvent, ReviewDeletedEvent } from '../notifications/events/notification.events';
import { ReviewVote } from './schemas/review-vote.schema';

import { Product } from '../common/schemas/product.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(ReviewVote.name) private readonly voteModel: Model<ReviewVote>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createReviewDto: CreateReviewDto, user: User): Promise<Review> {
    const product = await this.productModel.findById(createReviewDto.productId);
    if (!product) throw new NotFoundException('Product not found');

    const newReview = new this.reviewModel({
      ...createReviewDto,
      userId: user._id,
      productId: product._id,
    });
    const saved = await newReview.save();
    
    // Emit event with product info for contextual notifications
    this.eventEmitter.emit(
      'review.created',
      new ReviewCreatedEvent(
        saved._id as Types.ObjectId,
        product._id as Types.ObjectId,
        product.title,
        product.slug,
        user._id as Types.ObjectId,
        user.name,
        saved.rating,
      ),
    );

    return saved.populate('userId', 'name avatar');
  }

  async findByProduct(productId: string): Promise<any[]> {
    const reviews = await this.reviewModel
      .find({
        productId: new Types.ObjectId(productId),
        isActive: true,
      })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
      
    return Promise.all(
      reviews.map(async (review: any) => {
        const likesCount = await this.voteModel.countDocuments({ reviewId: review._id });
        return { ...review, likes: likesCount };
      })
    ) as Promise<any[]>;
  }

  async findById(id: string): Promise<Review> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }

  async toggleLike(reviewId: string, user: User): Promise<{ liked: boolean }> {
    const review = await this.findById(reviewId);
    
    const existing = await this.voteModel.findOne({
      reviewId: review._id,
      userId: user._id,
    });

    if (existing) {
      await this.voteModel.deleteOne({ _id: existing._id });
      return { liked: false };
    }

    await this.voteModel.create({
      reviewId: review._id,
      userId: user._id,
    });

    const product = await this.productModel.findById(review.productId);
    
    // Emit event with product slug for linking
    this.eventEmitter.emit(
      'review.liked',
      new ReviewLikedEvent(
        review._id as Types.ObjectId,
        user._id as Types.ObjectId,
        user.name,
        review.userId as Types.ObjectId,
        product?._id as Types.ObjectId,
        product?.slug,
      ),
    );

    return { liked: true };
  }

  async deleteReview(id: string, user: User): Promise<{ message: string }> {
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new ForbiddenException('Only admins can delete reviews');
    }

    const review = await this.findById(id);
    review.isActive = false;
    await review.save();

    const product = await this.productModel.findById(review.productId);

    this.eventEmitter.emit(
      'review.deleted',
      new ReviewDeletedEvent(
        review.userId as Types.ObjectId,
        product?._id as Types.ObjectId,
        product?.slug || '',
        user.name,
      )
    );

    return { message: 'Review deleted successfully' };
  }
}
