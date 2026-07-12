import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { User } from '../schemas/user.schema';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No authorization token provided');
    }

    const token = authHeader.split(' ')[1];
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new Error('JWT_SECRET is not configured');
      }
      const decoded: any = jwt.verify(token, secret);

      const user = await this.userModel.findById(decoded.id);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      if (user.isBlocked) {
        throw new ForbiddenException('User account is blocked');
      }

      // Attach user to request
      request.user = user;
      return true;
    } catch (err) {
      const secret = this.configService.get<string>('JWT_SECRET') || '';
      const maskedSecret =
        secret.length > 4
          ? `${secret.substring(0, 2)}...${secret.substring(secret.length - 2)}`
          : '***';

      console.error(`AuthGuard Debug [Secret: ${maskedSecret}]:`, err.message);

      if (
        err instanceof UnauthorizedException ||
        err instanceof ForbiddenException
      ) {
        // Carry over the specific message
        const responseMessage = `AuthGuard: ${err.message}`;
        throw new UnauthorizedException(responseMessage);
      }

      throw new UnauthorizedException(
        `AuthGuard: ${err.message || 'Invalid or expired token'}`,
      );
    }
  }
}
