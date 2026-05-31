import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const roleGuard: CanActivateFn = (route) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const currentRole =
    normalizeRole(sessionService.role()) ??
    normalizeRole(readRoleFromStoredUser()) ??
    normalizeRole(readRoleFromToken());

  if (currentRole && allowedRoles.includes(currentRole)) {
    return true;
  }

  return router.createUrlTree(['/']);
};

function readRoleFromStoredUser(): string | null {
  const rawUser = localStorage.getItem('rr_current_user');

  if (!rawUser) {
    return null;
  }

  try {
    const user = JSON.parse(rawUser) as { role?: string };
    return user.role ?? null;
  } catch {
    return null;
  }
}

function readRoleFromToken(): string | null {
  const token = localStorage.getItem('rr_access_token');

  if (!token) {
    return null;
  }

  try {
    const payloadPart = token.split('.')[1];

    if (!payloadPart) {
      return null;
    }

    const normalizedPayload = payloadPart
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - normalizedPayload.length % 4) % 4),
      '=',
    );

    const payload = JSON.parse(atob(paddedPayload)) as { role?: string };

    return payload.role ?? null;
  } catch {
    return null;
  }
}

function normalizeRole(role: string | null | undefined): string | null {
  if (!role) {
    return null;
  }

  return role.replace('ROLE_', '').trim();
}
