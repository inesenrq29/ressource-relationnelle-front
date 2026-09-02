import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { CsrfService } from '../services/csrf.service';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE']);

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  // seules les routes d'authentification sont protégées côté backend
  if (!req.url.startsWith(`${environment.apiUrl}/auth/`)) {
    return next(req);
  }

  const requestWithCredentials = req.clone({
    withCredentials: true,
  });

  // GET ne nécessite pas de jeton CSRF
  if (SAFE_METHODS.has(req.method)) {
    return next(requestWithCredentials);
  }

  const csrfToken = inject(CsrfService).getToken();

  if (!csrfToken) {
    return next(requestWithCredentials);
  }

  return next(
    requestWithCredentials.clone({
      setHeaders: {
        'X-XSRF-TOKEN': csrfToken,
      },
    }),
  );
};
