import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentification requise');
    }

    const hasPermission = user.role === Role.ADMIN || user.role === Role.MODERATOR;

    if (!hasPermission) {
      throw new ForbiddenException(
        "Tsy manana alalana amin'ity pejy ity ianao (Accès réservé aux administrateurs)"
      );
    }

    return true;
  }
}
