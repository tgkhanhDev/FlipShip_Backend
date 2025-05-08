import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../utils/metadata';

interface Account {
  role: string | string[]; // Support single role or array of roles
  [key: string]: any; // Allow other properties
}

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const account: Account | undefined = request.account;

    if (!account) {
      this.logger.warn('No account found in request');
      throw new ForbiddenException({
        status: 403,
        message: 'Bạn không có quyền truy cập tài nguyên này',
        detail: 'Không tìm thấy thông tin người dùng',
      });
    }

    // Normalize roles to array for consistent checking
    const userRoles = Array.isArray(account.role) ? account.role : [account.role];

    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException({
        status: 403,
        message: 'Bạn không có quyền truy cập tài nguyên này',
        detail: `Role yêu cầu: ${requiredRoles.join(', ')}, Role của người dùng: ${userRoles.join(', ')}`,
      });
    }

    return true;
  }
}