import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

interface CsrfResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class CsrfService {
  private readonly http = inject(HttpClient);
  private csrfToken: string | null = null;

  initialize(): Observable<CsrfResponse> {
    return this.http
      .get<CsrfResponse>(`${environment.apiUrl}/csrf`, {
        withCredentials: true,
      })
      .pipe(tap((response) => (this.csrfToken = response.token)));
  }

  getToken(): string | null {
    return this.csrfToken;
  }
}
