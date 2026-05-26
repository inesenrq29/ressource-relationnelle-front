import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const roleGuard: CanActivateFn = (route) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[] | undefined;
  const currentRole = sessionService.role();

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (currentRole && allowedRoles.includes(currentRole)) {
    return true;
  }

  return router.createUrlTree(['/']);
};
