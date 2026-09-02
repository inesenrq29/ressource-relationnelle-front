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
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionService = inject(SessionService);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

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
    const roleFromUserDto = this.extractRoleFromUserDto(response.userDto);
    const roleFromToken = this.extractRoleFromToken(response.accessToken);

    this.sessionService.setSession(
      {
        id: response.userDto.appUserId,
        pseudo: response.userDto.pseudo,
        email: response.userDto.mail,
        role: roleFromUserDto ?? roleFromToken ?? undefined,
      },
      response.accessToken,
    );
  }

  private extractRoleFromUserDto(userDto: UserDto): string | null {
    const userWithRole = userDto as unknown as {
      role?:
        | string
        | {
            roleName?: string;
            name?: string;
            authority?: string;
          };
    };

    if (!userWithRole.role) {
      return null;
    }

    if (typeof userWithRole.role === 'string') {
      return this.normalizeRole(userWithRole.role);
    }

    return this.normalizeRole(
      userWithRole.role.roleName ?? userWithRole.role.name ?? userWithRole.role.authority ?? null,
    );
  }

  private extractRoleFromToken(token: string | null | undefined): string | null {
    if (!token) {
      return null;
    }

    try {
      const payloadPart = token.split('.')[1];

      if (!payloadPart) {
        return null;
      }

      const normalizedPayload = payloadPart.replace(/-/g, '+').replace(/_/g, '/');

      const paddedPayload = normalizedPayload.padEnd(
        normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
        '=',
      );

      const decodedPayload = JSON.parse(atob(paddedPayload)) as {
        role?: string;
        authorities?: string[];
        scope?: string;
      };

      if (decodedPayload.role) {
        return this.normalizeRole(decodedPayload.role);
      }

      if (decodedPayload.authorities?.length) {
        return this.normalizeRole(decodedPayload.authorities[0]);
      }

      if (decodedPayload.scope) {
        return this.normalizeRole(decodedPayload.scope);
      }

      return null;
    } catch {
      return null;
    }
  }

  private normalizeRole(role: string | null): string | null {
    if (!role) {
      return null;
    }

    return role.replace('ROLE_', '').trim();
  }
}
