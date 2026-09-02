import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CsrfService } from './core/services/csrf.service';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { csrfInterceptor } from './core/interceptors/csrf-interceptor';
import { firstValueFrom } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([csrfInterceptor, authInterceptor])),
    provideAppInitializer(() => {
      const csrfService = inject(CsrfService);
      return firstValueFrom(csrfService.initialize());
    }),
  ],
};
