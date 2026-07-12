import { Controller, Get, Patch, Param, UseGuards, Post, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/schemas/user.schema';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async getMyNotifications(
    @CurrentUser() user: User | null,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const userId = user ? user._id.toString() : null;
    return this.notificationsService.findByUser(userId, parseInt(page), parseInt(limit));
  }

  @Get('unread-count')
  @UseGuards(AuthGuard)
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.notificationsService.getUnreadCount(user._id.toString());
    return { count };
  }

  @Patch(':id/read')
  @UseGuards(AuthGuard)
  async markRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.markAsRead(id, user._id.toString());
  }

  @Post('read-all')
  @UseGuards(AuthGuard)
  async markAllRead(@CurrentUser() user: User) {
    await this.notificationsService.markAllAsRead(user._id.toString());
    return { success: true };
  }
}
