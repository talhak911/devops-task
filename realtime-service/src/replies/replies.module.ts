import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RepliesController } from './replies.controller';
import { RepliesService } from './replies.service';
import { Reply, ReplySchema } from './schemas/reply.schema';
import { ReviewsModule } from '../reviews/reviews.module';
import { Product, ProductSchema } from '../common/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reply.name, schema: ReplySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    ReviewsModule,
  ],
  controllers: [RepliesController],
  providers: [RepliesService],
})
export class RepliesModule {}
