import { Injectable, computed, signal } from '@angular/core';

export interface SessionUser {
  id?: string;
  pseudo: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly storageUserKey = 'rr_current_user';
  private readonly storageTokenKey = 'rr_access_token';

  private readonly initialUser = this.readStoredUser();
  private readonly _user = signal<SessionUser | null>(this.initialUser);

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => {
    const user = this._user();
    const token = localStorage.getItem(this.storageTokenKey);

    return !!user && !!token;
  });

  setSession(user: SessionUser, token?: string): void {
    this._user.set(user);
    localStorage.setItem(this.storageUserKey, JSON.stringify(user));

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

  private readStoredUser(): SessionUser | null {
    const rawUser = localStorage.getItem(this.storageUserKey);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as SessionUser;
    } catch {
      localStorage.removeItem(this.storageUserKey);
      return null;
    }
  }
}
