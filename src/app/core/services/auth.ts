import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { SessionService } from './session.service';
import {
  ApiErrorResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserDto,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionService = inject(SessionService);

  private readonly apiUrl = '/api/auth';

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload, {
        withCredentials: true,
      })
      .pipe(tap((response) => this.persistSession(response)));
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, payload, {
        withCredentials: true,
      })
      .pipe(tap((response) => this.persistSession(response)));
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(
        `${this.apiUrl}/logout`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(tap(() => this.clearSession()));
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/refresh-token`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(tap((response) => this.persistSession(response)));
  }

  getAccessToken(): string | null {
    return this.sessionService.getToken();
  }

  getCurrentUser(): UserDto | null {
    const currentUser = this.sessionService.user();

    if (!currentUser) {
      return null;
    }

    return {
      appUserId: currentUser.id ?? '',
      pseudo: currentUser.pseudo,
      mail: currentUser.email ?? '',
      role: currentUser.role
        ? {
            roleName: currentUser.role,
          }
        : undefined,
    } as UserDto;
  }

  isLoggedIn(): boolean {
    return this.sessionService.isLoggedIn();
  }

  clearSession(): void {
    this.sessionService.clearSession();
  }

  getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as ApiErrorResponse | null;

      if (apiError?.message) {
        return apiError.message;
      }

      if (error.status === 0) {
        return 'Impossible de joindre le serveur.';
      }

      if (error.status === 401) {
        return 'Non autorisé.';
      }

      if (error.status === 404) {
        return 'Ressource introuvable.';
      }
    }

    return 'Une erreur est survenue.';
  }

  private persistSession(response: AuthResponse): void {
    this.sessionService.setSession(
      {
        id: response.userDto.appUserId,
        pseudo: response.userDto.pseudo,
        email: response.userDto.mail,
        role: response.userDto.role?.roleName,
      },
      response.accessToken,
    );
  }
}
