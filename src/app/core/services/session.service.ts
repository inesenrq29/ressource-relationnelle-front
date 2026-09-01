import { Injectable, computed, signal } from '@angular/core';

export interface SessionUser {
  id?: string;
  pseudo: string;
  email?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly storageUserKey = 'rr_current_user';
  private readonly storageTokenKey = 'rr_access_token';

  private readonly initialUser = this.readStoredUser();
  private readonly _user = signal<SessionUser | null>(this.initialUser);

  readonly user = this._user.asReadonly();

  readonly role = computed(() => this.getCurrentRole());

  readonly isLoggedIn = computed(() => {
    const user = this._user();
    const token = localStorage.getItem(this.storageTokenKey);

    return !!user && !!token;
  });

  setSession(user: SessionUser, token?: string): void {
    const normalizedUser: SessionUser = {
      ...user,
      role: this.normalizeRole(user.role) ?? undefined,
    };

    this._user.set(normalizedUser);
    localStorage.setItem(this.storageUserKey, JSON.stringify(normalizedUser));

    if (token) {
      localStorage.setItem(this.storageTokenKey, token);
    }
  }

  clearSession(): void {
    this._user.set(null);
    localStorage.removeItem(this.storageUserKey);
    localStorage.removeItem(this.storageTokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.storageTokenKey);
  }

  isAdmin(): boolean {
    const role = this.getCurrentRole();

    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  isModerator(): boolean {
    const role = this.getCurrentRole();

    return role === 'MODERATOR' || role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  private getCurrentRole(): string | null {
    const roleFromSignal = this.normalizeRole(this._user()?.role);
    const roleFromStorage = this.normalizeRole(this.readRoleFromStoredUser());
    const roleFromToken = this.normalizeRole(this.readRoleFromToken());

    return roleFromSignal ?? roleFromStorage ?? roleFromToken;
  }

  private readStoredUser(): SessionUser | null {
    const rawUser = localStorage.getItem(this.storageUserKey);

    if (!rawUser) {
      return null;
    }

    try {
      const user = JSON.parse(rawUser) as SessionUser;
      const role = this.normalizeRole(user.role) ?? this.readRoleFromToken();

      return {
        ...user,
        role: role ?? undefined,
      };
    } catch {
      localStorage.removeItem(this.storageUserKey);
      return null;
    }
  }

  private readRoleFromStoredUser(): string | null {
    const rawUser = localStorage.getItem(this.storageUserKey);

    if (!rawUser) {
      return null;
    }

    try {
      const user = JSON.parse(rawUser) as SessionUser;
      return user.role ?? null;
    } catch {
      return null;
    }
  }

  private readRoleFromToken(): string | null {
    const token = localStorage.getItem(this.storageTokenKey);

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

      const payload = JSON.parse(atob(paddedPayload)) as { role?: string };

      return payload.role ?? null;
    } catch {
      return null;
    }
  }

  private normalizeRole(role: string | null | undefined): string | null {
    if (!role) {
      return null;
    }

    return role.replace('ROLE_', '').trim();
  }
}
