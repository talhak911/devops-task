import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { RepliesService } from './replies.service';
import { CreateReplyDto } from './dto/reply.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/schemas/user.schema';

@Controller('replies')
export class RepliesController {
  constructor(private readonly repliesService: RepliesService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createReplyDto: CreateReplyDto, @CurrentUser() user: User) {
    return this.repliesService.create(createReplyDto, user);
  }

  @Get('review/:reviewId')
  async findByReview(@Param('reviewId') reviewId: string) {
    return this.repliesService.findByReview(reviewId);
  }
}
