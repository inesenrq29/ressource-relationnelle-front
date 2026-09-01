import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { SessionService } from '../../core/services/session.service';
import {
  AccountStatus,
  AdminRoleName,
  AdminUserDto,
  CreateUserWithRoleRequest,
  UserAdminService,
} from '../../core/services/user-admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userAdminService = inject(UserAdminService);
  protected readonly session = inject(SessionService);

  users = signal<AdminUserDto[]>([]);
  loading = signal(false);
  actionLoadingId = signal<string | null>(null);

  errorMessage = signal('');
  successMessage = signal('');

  createLoading = signal(false);
  createError = signal('');
  createSuccess = signal('');

  readonly privilegedRoles: { value: Exclude<AdminRoleName, 'USER'>; label: string }[] = [
    { value: 'MODERATOR', label: 'Modérateur' },
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'SUPER_ADMIN', label: 'Super-administrateur' },
  ];

  readonly sortedUsers = computed(() =>
    [...this.users()].sort((first, second) => {
      const roleOrder =
        this.getRoleOrder(first.role.roleName) - this.getRoleOrder(second.role.roleName);

      if (roleOrder !== 0) {
        return roleOrder;
      }

      return first.pseudo.localeCompare(second.pseudo, 'fr', { sensitivity: 'base' });
    }),
  );

  readonly usersCountLabel = computed(() => {
    const count = this.users().length;

    if (count === 0) return 'Aucun utilisateur';
    if (count === 1) return '1 utilisateur';

    return `${count} utilisateurs`;
  });

  createForm = this.fb.nonNullable.group({
    pseudo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    mail: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    roleName: ['MODERATOR' as Exclude<AdminRoleName, 'USER'>, Validators.required],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  isSuperAdmin(): boolean {
    return this.session.role() === 'SUPER_ADMIN';
  }

  canUpdateStatus(user: AdminUserDto): boolean {
    if (this.isCurrentUser(user)) {
      return false;
    }

    const currentRole = this.session.role();
    const targetRole = user.role.roleName;

    if (currentRole === 'SUPER_ADMIN') {
      return true;
    }

    if (currentRole === 'ADMIN') {
      return targetRole === 'USER';
    }

    return false;
  }

  isCurrentUser(user: AdminUserDto): boolean {
    return user.appUserId === this.session.user()?.id;
  }

  loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.userAdminService
      .getUsers()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (users) => {
          this.users.set(users ?? []);
        },
        error: () => {
          this.errorMessage.set('Impossible de charger les utilisateurs.');
        },
      });
  }

  disableUser(user: AdminUserDto): void {
    this.updateStatus(user, 'DISABLED');
  }

  enableUser(user: AdminUserDto): void {
    this.updateStatus(user, 'ACTIVE');
  }

  createUser(): void {
    this.createError.set('');
    this.createSuccess.set('');

    if (!this.isSuperAdmin()) {
      this.createError.set('Seul un super-administrateur peut créer ce type de compte.');
      return;
    }

    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.createError.set('Merci de remplir correctement tous les champs.');
      return;
    }

    const value = this.createForm.getRawValue();

    const payload: CreateUserWithRoleRequest = {
      pseudo: value.pseudo.trim(),
      mail: value.mail.trim().toLowerCase(),
      password: value.password,
      role: {
        roleName: value.roleName,
      },
    };

    this.createLoading.set(true);

    this.userAdminService
      .createUserWithRole(payload)
      .pipe(finalize(() => this.createLoading.set(false)))
      .subscribe({
        next: (createdUser) => {
          this.createSuccess.set('Compte créé avec succès.');
          this.createForm.reset({
            pseudo: '',
            mail: '',
            password: '',
            roleName: 'MODERATOR',
          });

          this.users.update((users) => [createdUser, ...users]);
        },
        error: (error) => {
          this.createError.set(error?.error?.message || 'Impossible de créer ce compte.');
        },
      });
  }

  getRoleLabel(role: AdminRoleName): string {
    const labels: Record<AdminRoleName, string> = {
      USER: 'Utilisateur',
      MODERATOR: 'Modérateur',
      ADMIN: 'Administrateur',
      SUPER_ADMIN: 'Super-admin',
    };

    return labels[role] ?? role;
  }

  getStatusLabel(user: AdminUserDto): string {
    return user.appUserIsActive ? 'Actif' : 'Désactivé';
  }

  getStatusClass(user: AdminUserDto): string {
    return user.appUserIsActive ? 'status-badge--active' : 'status-badge--disabled';
  }

  private updateStatus(user: AdminUserDto, status: AccountStatus): void {
    if (!this.canUpdateStatus(user) || this.actionLoadingId()) {
      return;
    }

    const label = status === 'ACTIVE' ? 'réactiver' : 'désactiver';
    const confirmed = window.confirm(`Confirmer : ${label} le compte de ${user.pseudo} ?`);

    if (!confirmed) {
      return;
    }

    this.actionLoadingId.set(user.appUserId);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.userAdminService
      .updateUserStatus(user.appUserId, status)
      .pipe(finalize(() => this.actionLoadingId.set(null)))
      .subscribe({
        next: () => {
          this.users.update((users) =>
            users.map((item) =>
              item.appUserId === user.appUserId
                ? {
                    ...item,
                    appUserIsActive: status === 'ACTIVE',
                  }
                : item,
            ),
          );

          this.successMessage.set(
            status === 'ACTIVE' ? 'Compte réactivé avec succès.' : 'Compte désactivé avec succès.',
          );
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.message || 'Impossible de modifier le statut.');
        },
      });
  }

  private getRoleOrder(role: AdminRoleName): number {
    const order: Record<AdminRoleName, number> = {
      SUPER_ADMIN: 1,
      ADMIN: 2,
      MODERATOR: 3,
      USER: 4,
    };

    return order[role] ?? 99;
  }

  get pseudo() {
    return this.createForm.controls.pseudo;
  }

  get mail() {
    return this.createForm.controls.mail;
  }

  get password() {
    return this.createForm.controls.password;
  }

  get roleName() {
    return this.createForm.controls.roleName;
  }
}
