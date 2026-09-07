import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const token = sessionService.getToken();

  if (!req.url.startsWith('/api')) {
    return next(req);
  }

  const requestWithCredentials = req.clone({
    withCredentials: true,
  });

  const mustNotSendAccessToken =
    req.url.startsWith('/api/csrf') ||
    req.url.startsWith('/api/auth/login') ||
    req.url.startsWith('/api/auth/register');

  if (!token || mustNotSendAccessToken) {
    return next(requestWithCredentials);
  }

  const authenticatedRequest = requestWithCredentials.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authenticatedRequest);
};
