// src/modules/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Agregar manejo de errores personalizado
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Si hay un error o no hay usuario, lanzar excepción
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        throw new UnauthorizedException('Token de autenticación no proporcionado');
      }
      
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token de autenticación expirado');
      }
      
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token de autenticación inválido');
      }
      
      throw err || new UnauthorizedException('No autorizado');
    }
    
    return user;
  }
}
