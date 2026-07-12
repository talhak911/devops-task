import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async create(data: {
    recipientId?: Types.ObjectId | null;
    actorId: Types.ObjectId;
    type: string;
    title: string;
    message: string;
    relatedId: Types.ObjectId;
    link?: string;
  }): Promise<Notification> {
    const notification = new this.notificationModel({
      ...data,
      recipientId: data.recipientId || null,
    });
    return notification.save();
  }

  async findByUser(userId: string | null, page: number = 1, limit: number = 10): Promise<Notification[]> {
    const query = userId 
      ? { $or: [{ recipientId: new Types.ObjectId(userId) }, { recipientId: null }] }
      : { recipientId: null };

    return this.notificationModel
      .find(query)
      .populate('actorId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: id, recipientId: new Types.ObjectId(userId) },
      { isRead: true },
      { new: true },
    );
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { recipientId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      recipientId: new Types.ObjectId(userId),
      isRead: false,
    });
  }
}
