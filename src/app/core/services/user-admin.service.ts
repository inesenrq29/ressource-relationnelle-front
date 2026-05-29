import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type AdminRoleName = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
export type AccountStatus = 'ACTIVE' | 'DISABLED';

export interface AdminRoleDto {
  roleId?: string;
  roleName: AdminRoleName;
}

export interface AdminUserDto {
  appUserId: string;
  mail: string;
  pseudo: string;
  appUserIsActive: boolean;
  lastConnectionAt?: string | null;
  role: AdminRoleDto;
}

export interface CreateUserWithRoleRequest {
  pseudo: string;
  mail: string;
  password: string;
  role: {
    roleName: Exclude<AdminRoleName, 'USER'>;
  };
}

@Injectable({
  providedIn: 'root',
})
export class UserAdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/users';

  getUsers(): Observable<AdminUserDto[]> {
    return this.http.get<AdminUserDto[]>(this.baseUrl);
  }

  updateUserStatus(userId: string, status: AccountStatus): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${userId}/status`, status);
  }

  createUserWithRole(payload: CreateUserWithRoleRequest): Observable<AdminUserDto> {
    return this.http.post<AdminUserDto>(`${this.baseUrl}/with-role`, payload);
  }
}
