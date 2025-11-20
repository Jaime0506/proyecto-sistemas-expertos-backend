import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RequestUser } from '../../auth/strategy/jwt.strategy';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      // Si no hay roles requeridos, permitir acceso
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: RequestUser = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    const hasRole = requiredRoles.some((role) => {
      // Verificar por userType
      if (user.userType === role) {
        return true;
      }
      // Verificar por roles en el array
      if (user.roles && user.roles.includes(role)) {
        return true;
      }
      return false;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        `No tienes permisos para acceder a este recurso. Roles requeridos: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}

