import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { ReviewCreatedEvent, ReplyAddedEvent, ReviewLikedEvent, ReviewDeletedEvent } from './events/notification.events';
import { EventsGateway } from '../sockets/events.gateway';

@Injectable()
export class NotificationsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @OnEvent('review.created')
  async handleReviewCreated(event: ReviewCreatedEvent) {
    console.log(`[NotificationListener] New review by ${event.userName} on product ${event.productName}`);
    
    // Persist as a GLOBAL notification (recipientId: null)
    const notification = await this.notificationsService.create({
      recipientId: null,
      actorId: event.userId as any,
      type: 'REVIEW_CREATED',
      title: 'New Review Added',
      message: `${event.userName} added a ${event.rating}⭐ review for ${event.productName}`,
      relatedId: event.reviewId as any,
      link: `/product/${event.productSlug}#reviews`,
    });

    // Broadcast for toast and list notifications to all users (Guests or Authenticated)
    this.eventsGateway.broadcast('review:created', {
      reviewId: event.reviewId,
      productId: event.productId,
      userName: event.userName,
      rating: event.rating,
      productName: event.productName,
      link: `/product/${event.productSlug}#reviews`,
      notification, // Pass the fully populated notification
    });
    
    // UI update trigger
    this.eventsGateway.broadcastToProduct(event.productId.toString(), 'review:updated', {});
  }

  @OnEvent('reply.added')
  async handleReplyAdded(event: ReplyAddedEvent) {
    console.log(`[NotificationListener] New reply by ${event.userName} on product ${event.productSlug}`);
    
    if (event.userId.toString() === event.reviewOwnerId.toString()) return;

    const notification = await this.notificationsService.create({
      recipientId: event.reviewOwnerId,
      actorId: event.userId,
      type: 'REPLY_ADDED',
      title: 'New Reply Received',
      message: `${event.userName} replied to your review on one of our products.`,
      relatedId: event.replyId,
      link: `/product/${event.productSlug}#reviews`,
    });

    this.eventsGateway.sendToUser(event.reviewOwnerId.toString(), 'notification:new', notification);
    this.eventsGateway.broadcastToProduct(event.productId.toString(), 'review:updated', {});
  }

  @OnEvent('review.liked')
  async handleReviewLiked(event: ReviewLikedEvent) {
    console.log(`[NotificationListener] User ${event.actorName} liked review ${event.reviewId}`);

    if (event.actorId.toString() === event.reviewOwnerId.toString()) return;

    const notification = await this.notificationsService.create({
      recipientId: event.reviewOwnerId as any,
      actorId: event.actorId as any,
      type: 'REVIEW_LIKED',
      title: 'Review Liked',
      message: `${event.actorName} liked your review.`,
      relatedId: event.reviewId as any,
      link: event.productSlug ? `/product/${event.productSlug}#reviews` : undefined,
    });

    this.eventsGateway.sendToUser(event.reviewOwnerId.toString(), 'notification:new', notification);
    this.eventsGateway.broadcastToProduct(event.productId.toString(), 'review:updated', {});
  }

  @OnEvent('review.deleted')
  async handleReviewDeleted(event: ReviewDeletedEvent) {
    console.log(`[NotificationListener] Admin ${event.adminName} deleted review ${event.productId}`);
    
    const notification = await this.notificationsService.create({
      recipientId: event.reviewOwnerId as any,
      actorId: null as any,
      type: 'REVIEW_DELETED',
      title: 'Review Removed',
      message: `Your review on product has been removed by ${event.adminName} for violating terms.`,
      relatedId: event.productId as any,
      link: `/product/${event.productSlug}#reviews`,
    });

    this.eventsGateway.sendToUser(event.reviewOwnerId.toString(), 'notification:new', notification);
    this.eventsGateway.broadcastToProduct(event.productId.toString(), 'review:updated', {});
  }
}
