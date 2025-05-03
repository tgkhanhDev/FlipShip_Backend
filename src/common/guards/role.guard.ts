import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../utils/metadata';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { account } = context.switchToHttp().getRequest(); //token from extract

    if(!account) {
      return false;
    }

    return requiredRoles.some((role) => {
      if(!account.role?.includes(role)) {
        throw new ForbiddenException({
          status: 403,
          message: 'Bạn không có quyền truy cập tài nguyên này',
          detail: `Role yêu cầu: ${role}, Role của người dùng: ${account.role}`,
        });
      }
      return account.role?.includes(role)
    });
  }
}